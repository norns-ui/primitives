"use client";

import {useControllableState, useId} from "@norns-ui/hooks";
import {createContextScope, Scope} from "@norns-ui/shared";
import {FC, ReactNode, RefObject, useCallback, useRef} from "react";

import {DialogContentElement} from "./DialogContent";

const DIALOG_NAME = "Dialog";

type ScopedProps<P> = P & {scopeDialog?: Scope};
const [createDialogContext, createDialogScope] =
  createContextScope(DIALOG_NAME);

type DialogContextValue = {
  triggerRef: RefObject<HTMLButtonElement>;
  contentRef: RefObject<DialogContentElement>;
  contentId: string;
  titleId: string;
  descriptionId: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOpenToggle(): void;
  modal: boolean;
};

const [DialogProvider, useDialogContext] =
  createDialogContext<DialogContextValue>(DIALOG_NAME);

interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  modal?: boolean;
}

const Dialog: FC<DialogProps> = ({
  scopeDialog,
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  modal = true,
}: ScopedProps<DialogProps>) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<DialogContentElement>(null);
  const [open = false, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <DialogProvider
      scope={scopeDialog}
      triggerRef={triggerRef}
      contentRef={contentRef}
      contentId={useId()}
      titleId={useId()}
      descriptionId={useId()}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={useCallback(
        () => setOpen((prevOpen) => !prevOpen),
        [setOpen],
      )}
      modal={modal}
    >
      {children}
    </DialogProvider>
  );
};

Dialog.displayName = DIALOG_NAME;

export {
  createDialogContext,
  createDialogScope,
  Dialog,
  DialogProvider,
  useDialogContext,
};
export type {DialogProps, ScopedProps};
