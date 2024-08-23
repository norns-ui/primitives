"use client";

import {ElementRef, forwardRef, useState} from "react";
import {Presence} from "@norns-ui/presence";
import {
  ScopedProps,
  useNavigationMenuContext,
  useViewportContentContext,
} from "./NavigationMenu";
import {Norn} from "@norns-ui/norn";
import {NornDivProps} from "./NavigationMenuSub";
import {useComposedRefs, useResizeObserver} from "@norns-ui/hooks";
import {
  CONTENT_NAME,
  NavigationMenuContentElement,
  NavigationMenuContentImpl,
} from "./NavigationMenuContent";
import {
  getOpenState,
  whenMouse,
  composeEventHandlers,
  composeRefs,
} from "@norns-ui/shared";

const VIEWPORT_NAME = "NavigationMenuViewport";

type NavigationMenuViewportElement = NavigationMenuViewportImplElement;
interface NavigationMenuViewportProps
  extends Omit<
    NavigationMenuViewportImplProps,
    "children" | "activeContentValue"
  > {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with React animation libraries.
   */
  forceMount?: true;
}

const NavigationMenuViewport = forwardRef<
  NavigationMenuViewportElement,
  NavigationMenuViewportProps
>(
  (
    {forceMount, ...restProps}: ScopedProps<NavigationMenuViewportProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(
      VIEWPORT_NAME,
      restProps.scopeNavigationMenu,
    );
    const open = Boolean(context.value);

    return (
      <Presence present={forceMount || open}>
        <NavigationMenuViewportImpl {...restProps} ref={forwardedRef} />
      </Presence>
    );
  },
);

NavigationMenuViewport.displayName = VIEWPORT_NAME;

/* -----------------------------------------------------------------------------------------------*/

type NavigationMenuViewportImplElement = ElementRef<typeof Norn.div>;
interface NavigationMenuViewportImplProps extends NornDivProps {}

const NavigationMenuViewportImpl = forwardRef<
  NavigationMenuViewportImplElement,
  NavigationMenuViewportImplProps
>(
  (
    {
      scopeNavigationMenu,
      children,
      ...restProps
    }: ScopedProps<NavigationMenuViewportImplProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(
      VIEWPORT_NAME,
      scopeNavigationMenu,
    );
    const composedRefs = useComposedRefs(
      forwardedRef,
      context.onViewportChange,
    );
    const viewportContentContext = useViewportContentContext(
      CONTENT_NAME,
      scopeNavigationMenu,
    );
    const [size, setSize] = useState<{
      width: number;
      height: number;
    } | null>(null);
    const [content, setContent] = useState<NavigationMenuContentElement | null>(
      null,
    );
    const viewportWidth = size ? size?.width + "px" : undefined;
    const viewportHeight = size ? size?.height + "px" : undefined;
    const open = Boolean(context.value);
    // We persist the last active content value as the viewport may be animating out
    // and we want the content to remain mounted for the lifecycle of the viewport.
    const activeContentValue = open ? context.value : context.previousValue;

    /**
     * Update viewport size to match the active content node.
     * We prefer offset dimensions over `getBoundingClientRect` as the latter respects CSS transform.
     * For example, if content animates in from `scale(0.5)` the dimensions would be anything
     * from `0.5` to `1` of the intended size.
     */
    const handleSizeChange = () => {
      if (content)
        setSize({width: content.offsetWidth, height: content.offsetHeight});
    };
    useResizeObserver(content, handleSizeChange);

    return (
      <Norn.div
        data-state={getOpenState(open)}
        data-orientation={context.orientation}
        {...restProps}
        ref={composedRefs}
        style={{
          // Prevent interaction when animating out
          pointerEvents: !open && context.isRootMenu ? "none" : undefined,
          ["--norns-navigation-menu-viewport-width" as any]: viewportWidth,
          ["--norns-navigation-menu-viewport-height" as any]: viewportHeight,
          ...restProps.style,
        }}
        onPointerEnter={composeEventHandlers(
          restProps.onPointerEnter,
          context.onContentEnter,
        )}
        onPointerLeave={composeEventHandlers(
          restProps.onPointerLeave,
          whenMouse(context.onContentLeave),
        )}
      >
        {Array.from(viewportContentContext.items).map(
          ([value, {ref, forceMount, ...props}]) => {
            const isActive = activeContentValue === value;
            return (
              <Presence key={value} present={forceMount || isActive}>
                <NavigationMenuContentImpl
                  {...props}
                  ref={composeRefs(ref, (node) => {
                    // We only want to update the stored node when another is available
                    // as we need to smoothly transition between them.
                    if (isActive && node) setContent(node);
                  })}
                />
              </Presence>
            );
          },
        )}
      </Norn.div>
    );
  },
);

export {NavigationMenuViewport};
export type {NavigationMenuViewportElement, NavigationMenuViewportProps};
