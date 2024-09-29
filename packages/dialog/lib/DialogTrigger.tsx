"use client";

import {useComposedRefs} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {composeEventHandlers, getOpenState} from "@norns-ui/shared";
import {ComponentPropsWithoutRef, ElementRef, forwardRef} from "react";

import {ScopedProps, useDialogContext} from "./Dialog";

const TRIGGER_NAME = "DialogTrigger";

type DialogTriggerElement = ElementRef<typeof Norn.button>;
type NornButtonProps = ComponentPropsWithoutRef<typeof Norn.button>;
interface DialogTriggerProps extends NornButtonProps {}

const DialogTrigger = forwardRef<DialogTriggerElement, DialogTriggerProps>(
  (props: ScopedProps<DialogTriggerProps>, forwardedRef) => {
    const {scopeDialog, ...triggerProps} = props;
    const context = useDialogContext(TRIGGER_NAME, scopeDialog);
    const composedTriggerRef = useComposedRefs(
      forwardedRef,
      context.triggerRef,
    );
    return (
      <Norn.button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        data-state={getOpenState(context.open)}
        {...triggerProps}
        ref={composedTriggerRef}
        onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
      />
    );
  },
);

DialogTrigger.displayName = TRIGGER_NAME;

export {DialogTrigger};
export type {DialogTriggerProps, NornButtonProps};
