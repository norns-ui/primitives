"use client";

import {useLayoutEffect} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useState,
} from "react";
import {createPortal} from "react-dom";

const PORTAL_NAME = "Portal";

type PortalElement = ElementRef<typeof Norn.div>;
type NornDivProps = ComponentPropsWithoutRef<typeof Norn.div>;
interface PortalProps extends NornDivProps {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: Element | DocumentFragment | null;
}

const Portal = forwardRef<PortalElement, PortalProps>(
  ({container: containerProp, ...portalProps}, forwardedRef) => {
    const [mounted, setMounted] = useState(false);
    useLayoutEffect(() => setMounted(true), []);
    const container = containerProp || (mounted && globalThis?.document?.body);
    return container
      ? createPortal(
          <Norn.div {...portalProps} ref={forwardedRef} />,
          container,
        )
      : null;
  },
);

Portal.displayName = PORTAL_NAME;

export {Portal};
export type {PortalProps};
