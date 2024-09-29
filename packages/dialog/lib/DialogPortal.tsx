"use client";

import {Portal} from "@norns-ui/portal";
import {Presence} from "@norns-ui/presence";
import {Children, ComponentPropsWithoutRef, FC, ReactNode} from "react";

import {createDialogContext, ScopedProps, useDialogContext} from "./Dialog";

const PORTAL_NAME = "DialogPortal";

type PortalContextValue = {forceMount?: true};
const [PortalProvider, usePortalContext] =
  createDialogContext<PortalContextValue>(PORTAL_NAME, {
    forceMount: undefined,
  });

type PortalProps = ComponentPropsWithoutRef<typeof Portal>;
interface DialogPortalProps {
  children?: ReactNode;
  /**
   * Specify a container element to portal the content into.
   */
  container?: PortalProps["container"];
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const DialogPortal: FC<DialogPortalProps> = ({
  scopeDialog,
  forceMount,
  children,
  container,
}: ScopedProps<DialogPortalProps>) => {
  const context = useDialogContext(PORTAL_NAME, scopeDialog);
  return (
    <PortalProvider scope={scopeDialog} forceMount={forceMount}>
      {Children.map(children, (child) => (
        <Presence present={forceMount || context.open}>
          <Portal asChild container={container}>
            {child}
          </Portal>
        </Presence>
      ))}
    </PortalProvider>
  );
};

DialogPortal.displayName = PORTAL_NAME;

export {DialogPortal, usePortalContext};
export type {DialogPortalProps};
