import {Norn} from "@norns-ui/norn";
import {ElementRef, forwardRef, useEffect, useState} from "react";

import {NornSpanProps, ScopedProps, useAvatarContext} from "./Avatar";

const FALLBACK_NAME = "AvatarFallback";

type AvatarFallbackElement = ElementRef<typeof Norn.span>;
interface AvatarFallbackProps extends NornSpanProps {
  delayMs?: number;
}

const AvatarFallback = forwardRef<AvatarFallbackElement, AvatarFallbackProps>(
  (
    {scopeAvatar, delayMs, ...restProps}: ScopedProps<AvatarFallbackProps>,
    forwardedRef,
  ) => {
    const context = useAvatarContext(FALLBACK_NAME, scopeAvatar);
    const [canRender, setCanRender] = useState(delayMs === undefined);

    useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);

    return canRender && context.imageLoadingStatus !== "loaded" ? (
      <Norn.span {...restProps} ref={forwardedRef} />
    ) : null;
  },
);

AvatarFallback.displayName = FALLBACK_NAME;

export {AvatarFallback};
export type {AvatarFallbackProps};
