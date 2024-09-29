import {Norn} from "@norns-ui/norn";
import {composeEventHandlers} from "@norns-ui/shared";
import {ElementRef, forwardRef} from "react";

import {ScopedProps, useDialogContext} from "./Dialog";
import {NornButtonProps} from "./DialogTrigger";

const CLOSE_NAME = "DialogClose";

type DialogCloseElement = ElementRef<typeof Norn.button>;
interface DialogCloseProps extends NornButtonProps {}

const DialogClose = forwardRef<DialogCloseElement, DialogCloseProps>(
  (props: ScopedProps<DialogCloseProps>, forwardedRef) => {
    const {scopeDialog, ...closeProps} = props;
    const context = useDialogContext(CLOSE_NAME, scopeDialog);
    return (
      <Norn.button
        type="button"
        {...closeProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, () =>
          context.onOpenChange(false),
        )}
      />
    );
  },
);

DialogClose.displayName = CLOSE_NAME;

export {DialogClose};
export type {DialogCloseProps};
