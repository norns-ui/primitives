"use client";

import {DismissableLayer} from "@norns-ui/dismissable-layer";
import {useFocusGuards} from "@norns-ui/focus-guards";
import {FocusScope} from "@norns-ui/focus-scope";
import {useComposedRefs} from "@norns-ui/hooks";
import {Presence} from "@norns-ui/presence";
import {composeEventHandlers, getOpenState} from "@norns-ui/shared";
import {hideOthers} from "aria-hidden";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useEffect,
  useRef,
} from "react";

import {ScopedProps, useDialogContext} from "./Dialog";
import {usePortalContext} from "./DialogPortal";
import {DescriptionWarning, TitleWarning} from "./Warning";

const CONTENT_NAME = "DialogContent";

type DialogContentImplElement = ElementRef<typeof DismissableLayer>;
type DismissableLayerProps = ComponentPropsWithoutRef<typeof DismissableLayer>;
type FocusScopeProps = ComponentPropsWithoutRef<typeof FocusScope>;
interface DialogContentImplProps
  extends Omit<DismissableLayerProps, "onDismiss"> {
  /**
   * When `true`, focus cannot escape the `Content` via keyboard,
   * pointer, or a programmatic focus.
   * @defaultValue false
   */
  trapFocus?: FocusScopeProps["trapped"];

  /**
   * Event handler called when auto-focusing on open.
   * Can be prevented.
   */
  onOpenAutoFocus?: FocusScopeProps["onMountAutoFocus"];

  /**
   * Event handler called when auto-focusing on close.
   * Can be prevented.
   */
  onCloseAutoFocus?: FocusScopeProps["onUnmountAutoFocus"];
}

const DialogContentImpl = forwardRef<
  DialogContentImplElement,
  DialogContentImplProps
>(
  (
    {
      scopeDialog,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      ...contentProps
    }: ScopedProps<DialogContentImplProps>,
    forwardedRef,
  ) => {
    const context = useDialogContext(CONTENT_NAME, scopeDialog);
    const contentRef = useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);

    // Make sure the whole tree has focus guards as our `Dialog` will be
    // the last element in the DOM (because of the `Portal`)
    useFocusGuards();

    return (
      <>
        <FocusScope
          asChild
          loop
          trapped={trapFocus}
          onMountAutoFocus={onOpenAutoFocus}
          onUnmountAutoFocus={onCloseAutoFocus}
        >
          <DismissableLayer
            role="dialog"
            id={context.contentId}
            aria-describedby={context.descriptionId}
            aria-labelledby={context.titleId}
            data-state={getOpenState(context.open)}
            {...contentProps}
            ref={composedRefs}
            onDismiss={() => context.onOpenChange(false)}
          />
        </FocusScope>
        {process.env.NODE_ENV !== "production" && (
          <>
            <TitleWarning titleId={context.titleId} />
            <DescriptionWarning
              contentRef={contentRef}
              descriptionId={context.descriptionId}
            />
          </>
        )}
      </>
    );
  },
);

const DialogContentNonModal = forwardRef<
  DialogContentTypeElement,
  DialogContentTypeProps
>((props: ScopedProps<DialogContentTypeProps>, forwardedRef) => {
  const context = useDialogContext(CONTENT_NAME, props.scopeDialog);
  const hasInteractedOutsideRef = useRef(false);
  const hasPointerDownOutsideRef = useRef(false);

  return (
    <DialogContentImpl
      {...props}
      ref={forwardedRef}
      trapFocus={false}
      disableOutsidePointerEvents={false}
      onCloseAutoFocus={(event) => {
        props.onCloseAutoFocus?.(event);

        if (!event.defaultPrevented) {
          if (!hasInteractedOutsideRef.current) {
            context.triggerRef.current?.focus();
          }
          // Always prevent auto focus because we either focus manually or want user agent focus
          event.preventDefault();
        }

        hasInteractedOutsideRef.current = false;
        hasPointerDownOutsideRef.current = false;
      }}
      onInteractOutside={(event) => {
        props.onInteractOutside?.(event);

        if (!event.defaultPrevented) {
          hasInteractedOutsideRef.current = true;
          if (event.detail.originalEvent.type === "pointerdown") {
            hasPointerDownOutsideRef.current = true;
          }
        }

        // Prevent dismissing when clicking the trigger.
        // As the trigger is already setup to close, without doing so would
        // cause it to close and immediately open.
        const target = event.target as HTMLElement;
        const targetIsTrigger = context.triggerRef.current?.contains(target);
        if (targetIsTrigger) {
          event.preventDefault();
        }

        // On Safari if the trigger is inside a container with tabIndex={0}, when clicked
        // we will get the pointer down outside event on the trigger, but then a subsequent
        // focus outside event on the container, we ignore any focus outside event when we've
        // already had a pointer down outside event.
        if (
          event.detail.originalEvent.type === "focusin" &&
          hasPointerDownOutsideRef.current
        ) {
          event.preventDefault();
        }
      }}
    />
  );
});

type DialogContentTypeElement = DialogContentImplElement;
interface DialogContentTypeProps
  extends Omit<
    DialogContentImplProps,
    "trapFocus" | "disableOutsidePointerEvents"
  > {}

const DialogContentModal = forwardRef<
  DialogContentTypeElement,
  DialogContentTypeProps
>((props: ScopedProps<DialogContentTypeProps>, forwardedRef) => {
  const context = useDialogContext(CONTENT_NAME, props.scopeDialog);
  const contentRef = useRef<HTMLDivElement>(null);
  const composedRefs = useComposedRefs(
    forwardedRef,
    context.contentRef,
    contentRef,
  );

  // aria-hide everything except the content (better supported equivalent to setting aria-modal)
  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      return hideOthers(content);
    }
  }, []);

  return (
    <DialogContentImpl
      {...props}
      ref={composedRefs}
      // we make sure focus isn't trapped once `DialogContent` has been closed
      // (closed !== unmounted when animating out)
      trapFocus={context.open}
      disableOutsidePointerEvents
      onCloseAutoFocus={composeEventHandlers(
        props.onCloseAutoFocus,
        (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        },
      )}
      onPointerDownOutside={composeEventHandlers(
        props.onPointerDownOutside,
        (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick =
            originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;

          // If the event is a right-click, we shouldn't close because
          // it is effectively as if we right-clicked the `Overlay`.
          if (isRightClick) {
            event.preventDefault();
          }
        },
      )}
      // When focus is trapped, a `focusout` event may still happen.
      // We make sure we don't trigger our `onDismiss` in such case.
      onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) =>
        event.preventDefault(),
      )}
    />
  );
});

type DialogContentElement = DialogContentTypeElement;
interface DialogContentProps extends DialogContentTypeProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const DialogContent = forwardRef<DialogContentElement, DialogContentProps>(
  (props: ScopedProps<DialogContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.scopeDialog);
    const {forceMount = portalContext.forceMount, ...contentProps} = props;
    const context = useDialogContext(CONTENT_NAME, props.scopeDialog);
    return (
      <Presence present={forceMount || context.open}>
        {context.modal ? (
          <DialogContentModal {...contentProps} ref={forwardedRef} />
        ) : (
          <DialogContentNonModal {...contentProps} ref={forwardedRef} />
        )}
      </Presence>
    );
  },
);

DialogContent.displayName = CONTENT_NAME;

export {CONTENT_NAME, DialogContent};
export type {DialogContentElement, DialogContentProps};
