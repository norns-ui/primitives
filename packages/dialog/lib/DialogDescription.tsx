/* eslint-disable react/prop-types */
"use client";

import {Norn} from "@norns-ui/norn";
import React from "react";

import {ScopedProps, useDialogContext} from "./Dialog";

const DESCRIPTION_NAME = "DialogDescription";

type DialogDescriptionElement = React.ElementRef<typeof Norn.p>;
type NornParagraphProps = React.ComponentPropsWithoutRef<typeof Norn.p>;
interface DialogDescriptionProps extends NornParagraphProps {}

const DialogDescription = React.forwardRef<
  DialogDescriptionElement,
  DialogDescriptionProps
>(
  (
    {scopeDialog, ...descriptionProps}: ScopedProps<DialogDescriptionProps>,
    forwardedRef,
  ) => {
    const context = useDialogContext(DESCRIPTION_NAME, scopeDialog);
    return (
      <Norn.p
        id={context.descriptionId}
        {...descriptionProps}
        ref={forwardedRef}
      />
    );
  },
);

DialogDescription.displayName = DESCRIPTION_NAME;

export {DialogDescription};
export type {DialogDescriptionProps};
