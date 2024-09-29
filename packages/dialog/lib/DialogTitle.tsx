"use client";

import {Norn} from "@norns-ui/norn";
import {ComponentPropsWithoutRef, ElementRef, forwardRef} from "react";

import {ScopedProps, useDialogContext} from "./Dialog";

const TITLE_NAME = "DialogTitle";

type DialogTitleElement = ElementRef<typeof Norn.h2>;
type NornHeading2Props = ComponentPropsWithoutRef<typeof Norn.h2>;
interface DialogTitleProps extends NornHeading2Props {}

const DialogTitle = forwardRef<DialogTitleElement, DialogTitleProps>(
  (
    {scopeDialog, ...titleProps}: ScopedProps<DialogTitleProps>,
    forwardedRef,
  ) => {
    const context = useDialogContext(TITLE_NAME, scopeDialog);
    return <Norn.h2 id={context.titleId} {...titleProps} ref={forwardedRef} />;
  },
);

DialogTitle.displayName = TITLE_NAME;

export {DialogTitle, TITLE_NAME};
export type {DialogTitleProps};
