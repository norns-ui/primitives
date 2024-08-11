"use client";

import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  MutableRefObject,
  RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {Presence} from "@norns-ui/presence";
import {NavigationMenuTriggerElement} from "./NavigationMenuTrigger";
import {
  FocusProxyElement,
  useNavigationMenuItemContext,
} from "./NavigationMenuItem";
import {DismissableLayer} from "@norns-ui/dismissable-layer";
import {
  getOpenState,
  makeContentId,
  makeTriggerId,
  whenMouse,
  composeEventHandlers,
  focusFirst,
  getTabbableCandidates,
} from "@norns-ui/shared";
import {useComposedRefs, useLayoutEffect} from "@norns-ui/hooks";
import {
  ScopedProps,
  useCollection,
  useNavigationMenuContext,
} from "./NavigationMenu";
import {FocusGroup} from "./FocusGroup";

const CONTENT_NAME = "NavigationMenuContent";

type NavigationMenuContentElement = NavigationMenuContentImplElement;
interface NavigationMenuContentProps
  extends Omit<
    NavigationMenuContentImplProps,
    keyof NavigationMenuContentImplPrivateProps
  > {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const NavigationMenuContent = forwardRef<
  NavigationMenuContentElement,
  NavigationMenuContentProps
>(
  (
    {forceMount, ...restProps}: ScopedProps<NavigationMenuContentProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(
      CONTENT_NAME,
      restProps.scopeNavigationMenu,
    );
    const itemContext = useNavigationMenuItemContext(
      CONTENT_NAME,
      restProps.scopeNavigationMenu,
    );
    const composedRefs = useComposedRefs(itemContext.contentRef, forwardedRef);
    const open = itemContext.value === context.value;

    const commonProps = {
      value: itemContext.value,
      triggerRef: itemContext.triggerRef,
      focusProxyRef: itemContext.focusProxyRef,
      wasEscapeCloseRef: itemContext.wasEscapeCloseRef,
      onContentFocusOutside: itemContext.onContentFocusOutside,
      onRootContentClose: itemContext.onRootContentClose,
      ...restProps,
    };

    return !context.viewport ? (
      <Presence present={forceMount || open}>
        <NavigationMenuContentImpl
          data-state={getOpenState(open)}
          {...commonProps}
          ref={composedRefs}
          onPointerEnter={composeEventHandlers(
            restProps.onPointerEnter,
            context.onContentEnter,
          )}
          onPointerLeave={composeEventHandlers(
            restProps.onPointerLeave,
            whenMouse(context.onContentLeave),
          )}
          style={{
            // Prevent interaction when animating out
            pointerEvents: !open && context.isRootMenu ? "none" : undefined,
            ...commonProps.style,
          }}
        />
      </Presence>
    ) : (
      <ViewportContentMounter
        forceMount={forceMount}
        {...commonProps}
        ref={composedRefs}
      />
    );
  },
);

NavigationMenuContent.displayName = CONTENT_NAME;

/* -----------------------------------------------------------------------------------------------*/

type ViewportContentMounterElement = NavigationMenuContentImplElement;
interface ViewportContentMounterProps extends NavigationMenuContentImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const ViewportContentMounter = forwardRef<
  ViewportContentMounterElement,
  ViewportContentMounterProps
>((props: ScopedProps<ViewportContentMounterProps>, forwardedRef) => {
  const context = useNavigationMenuContext(
    CONTENT_NAME,
    props.scopeNavigationMenu,
  );
  const {onViewportContentChange, onViewportContentRemove} = context;

  useLayoutEffect(() => {
    onViewportContentChange(props.value, {
      ref: forwardedRef,
      ...props,
    });
  }, [props, forwardedRef, onViewportContentChange]);

  useLayoutEffect(() => {
    return () => onViewportContentRemove(props.value);
  }, [props.value, onViewportContentRemove]);

  // Content is proxied into the viewport
  return null;
});

/* -----------------------------------------------------------------------------------------------*/

const ROOT_CONTENT_DISMISS = "navigationMenu.rootContentDismiss";

type MotionAttribute = "to-start" | "to-end" | "from-start" | "from-end";
type NavigationMenuContentImplElement = ElementRef<typeof DismissableLayer>;
type DismissableLayerProps = ComponentPropsWithoutRef<typeof DismissableLayer>;

interface NavigationMenuContentImplPrivateProps {
  value: string;
  triggerRef: RefObject<NavigationMenuTriggerElement>;
  focusProxyRef: RefObject<FocusProxyElement>;
  wasEscapeCloseRef: MutableRefObject<boolean>;
  onContentFocusOutside(): void;
  onRootContentClose(): void;
}
interface NavigationMenuContentImplProps
  extends Omit<
      DismissableLayerProps,
      "onDismiss" | "disableOutsidePointerEvents"
    >,
    NavigationMenuContentImplPrivateProps {}

const NavigationMenuContentImpl = forwardRef<
  NavigationMenuContentImplElement,
  NavigationMenuContentImplProps
>(
  (
    {
      scopeNavigationMenu,
      value,
      triggerRef,
      focusProxyRef,
      wasEscapeCloseRef,
      onRootContentClose,
      onContentFocusOutside,
      ...restProps
    }: ScopedProps<NavigationMenuContentImplProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(CONTENT_NAME, scopeNavigationMenu);
    const ref = useRef<NavigationMenuContentImplElement>(null);
    const composedRefs = useComposedRefs(ref, forwardedRef);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const getItems = useCollection(scopeNavigationMenu);
    const prevMotionAttributeRef = useRef<MotionAttribute | null>(null);

    const {onItemDismiss} = context;

    useEffect(() => {
      const content = ref.current;

      // Bubble dismiss to the root content node and focus its trigger
      if (context.isRootMenu && content) {
        const handleClose = () => {
          onItemDismiss();
          onRootContentClose();
          if (content.contains(document.activeElement))
            triggerRef.current?.focus();
        };
        content.addEventListener(ROOT_CONTENT_DISMISS, handleClose);
        return () =>
          content.removeEventListener(ROOT_CONTENT_DISMISS, handleClose);
      }
    }, [
      context.isRootMenu,
      value,
      triggerRef,
      onItemDismiss,
      onRootContentClose,
    ]);

    const motionAttribute = useMemo(() => {
      const items = getItems();
      const values = items.map((item) => item.value);
      if (context.dir === "rtl") values.reverse();
      const index = values.indexOf(context.value);
      const prevIndex = values.indexOf(context.previousValue);
      const isSelected = value === context.value;
      const wasSelected = prevIndex === values.indexOf(value);

      // We only want to update selected and the last selected content
      // this avoids animations being interrupted outside of that range
      if (!isSelected && !wasSelected) return prevMotionAttributeRef.current;

      const attribute = (() => {
        // Don't provide a direction on the initial open
        if (index !== prevIndex) {
          // If we're moving to this item from another
          if (isSelected && prevIndex !== -1)
            return index > prevIndex ? "from-end" : "from-start";
          // If we're leaving this item for another
          if (wasSelected && index !== -1)
            return index > prevIndex ? "to-start" : "to-end";
        }
        // Otherwise we're entering from closed or leaving the list
        // entirely and should not animate in any direction
        return null;
      })();

      prevMotionAttributeRef.current = attribute;
      return attribute;
    }, [context.previousValue, context.value, context.dir, getItems, value]);

    return (
      <FocusGroup asChild>
        <DismissableLayer
          id={contentId}
          aria-labelledby={triggerId}
          data-motion={motionAttribute}
          data-orientation={context.orientation}
          {...restProps}
          ref={composedRefs}
          disableOutsidePointerEvents={false}
          onDismiss={() => {
            const rootContentDismissEvent = new Event(ROOT_CONTENT_DISMISS, {
              bubbles: true,
              cancelable: true,
            });
            ref.current?.dispatchEvent(rootContentDismissEvent);
          }}
          onFocusOutside={composeEventHandlers(
            restProps.onFocusOutside,
            (event) => {
              onContentFocusOutside();
              const target = event.target as HTMLElement;
              // Only dismiss content when focus moves outside of the menu
              if (context.rootNavigationMenu?.contains(target))
                event.preventDefault();
            },
          )}
          onPointerDownOutside={composeEventHandlers(
            restProps.onPointerDownOutside,
            (event) => {
              const target = event.target as HTMLElement;
              const isTrigger = getItems().some((item) =>
                item.ref.current?.contains(target),
              );
              const isRootViewport =
                context.isRootMenu && context.viewport?.contains(target);
              if (isTrigger || isRootViewport || !context.isRootMenu)
                event.preventDefault();
            },
          )}
          onKeyDown={composeEventHandlers(restProps.onKeyDown, (event) => {
            const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
            const isTabKey = event.key === "Tab" && !isMetaKey;
            if (isTabKey) {
              const candidates = getTabbableCandidates(event.currentTarget);
              const focusedElement = document.activeElement;
              const index = candidates.findIndex(
                (candidate) => candidate === focusedElement,
              );
              const isMovingBackwards = event.shiftKey;
              const nextCandidates = isMovingBackwards
                ? candidates.slice(0, index).reverse()
                : candidates.slice(index + 1, candidates.length);

              if (focusFirst(nextCandidates)) {
                // prevent browser tab keydown because we've handled focus
                event.preventDefault();
              } else {
                // If we can't focus that means we're at the edges
                // so focus the proxy and let browser handle
                // tab/shift+tab keypress on the proxy instead
                focusProxyRef.current?.focus();
              }
            }
          })}
          onEscapeKeyDown={composeEventHandlers(
            restProps.onEscapeKeyDown,
            (event) => {
              // prevent the dropdown from reopening
              // after the escape key has been pressed
              wasEscapeCloseRef.current = true;
            },
          )}
        />
      </FocusGroup>
    );
  },
);

export {
  CONTENT_NAME,
  NavigationMenuContent,
  NavigationMenuContentImpl,
  ViewportContentMounter,
  ROOT_CONTENT_DISMISS,
};
export type {
  NavigationMenuContentElement,
  ViewportContentMounterElement,
  NavigationMenuContentProps,
  ViewportContentMounterProps,
};
