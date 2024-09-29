"use client";

import {Norn} from "@norns-ui/norn";
import {Presence} from "@norns-ui/presence";
import {getOpenState} from "@norns-ui/shared";
import {Slot} from "@norns-ui/slot";
import {ComponentPropsWithoutRef, ElementRef, forwardRef} from "react";
import {RemoveScroll} from "react-remove-scroll";

import {ScopedProps, useDialogContext} from "./Dialog";
import {usePortalContext} from "./DialogPortal";

const OVERLAY_NAME = "DialogOverlay";

type DialogOverlayImplElement = ElementRef<typeof Norn.div>;
type NornDivProps = ComponentPropsWithoutRef<typeof Norn.div>;
interface DialogOverlayImplProps extends NornDivProps {}

const DialogOverlayImpl = forwardRef<
  DialogOverlayImplElement,
  DialogOverlayImplProps
>(
  (
    {scopeDialog, ...overlayProps}: ScopedProps<DialogOverlayImplProps>,
    forwardedRef,
  ) => {
    const context = useDialogContext(OVERLAY_NAME, scopeDialog);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      <RemoveScroll as={Slot} allowPinchZoom shards={[context.contentRef]}>
        <Norn.div
          data-state={getOpenState(context.open)}
          {...overlayProps}
          ref={forwardedRef}
          // We re-enable pointer-events prevented by `Dialog.Content` to allow scrolling the overlay.
          style={{pointerEvents: "auto", ...overlayProps.style}}
        />
      </RemoveScroll>
    );
  },
);

type DialogOverlayElement = DialogOverlayImplElement;
interface DialogOverlayProps extends DialogOverlayImplProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const DialogOverlay = forwardRef<DialogOverlayElement, DialogOverlayProps>(
  (props: ScopedProps<DialogOverlayProps>, forwardedRef) => {
    const portalContext = usePortalContext(OVERLAY_NAME, props.scopeDialog);
    const {forceMount = portalContext.forceMount, ...overlayProps} = props;
    const context = useDialogContext(OVERLAY_NAME, props.scopeDialog);
    return context.modal ? (
      <Presence present={forceMount || context.open}>
        <DialogOverlayImpl {...overlayProps} ref={forwardedRef} />
      </Presence>
    ) : null;
  },
);

DialogOverlay.displayName = OVERLAY_NAME;

export {DialogOverlay};
export type {DialogOverlayProps};
