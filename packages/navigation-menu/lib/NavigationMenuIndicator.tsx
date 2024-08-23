"use client";

import {ElementRef, forwardRef, useEffect, useState} from "react";
import {
  ScopedProps,
  useCollection,
  useNavigationMenuContext,
} from "./NavigationMenu";
import {useResizeObserver} from "@norns-ui/hooks";
import {createPortal} from "react-dom";
import {Presence} from "@norns-ui/presence";
import {Norn} from "@norns-ui/norn";
import {NornDivProps} from "./NavigationMenuSub";
import {NavigationMenuTriggerElement} from "./NavigationMenuTrigger";

const INDICATOR_NAME = "NavigationMenuIndicator";

type NavigationMenuIndicatorElement = NavigationMenuIndicatorImplElement;
interface NavigationMenuIndicatorProps
  extends NavigationMenuIndicatorImplProps {
  forceMount?: true;
}

const NavigationMenuIndicator = forwardRef<
  NavigationMenuIndicatorElement,
  NavigationMenuIndicatorProps
>(
  (
    {forceMount, ...restProps}: ScopedProps<NavigationMenuIndicatorProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(
      INDICATOR_NAME,
      restProps.scopeNavigationMenu,
    );
    const isVisible = Boolean(context.value);

    return context.indicatorTrack
      ? createPortal(
          <Presence present={forceMount || isVisible}>
            <NavigationMenuIndicatorImpl {...restProps} ref={forwardedRef} />
          </Presence>,
          context.indicatorTrack,
        )
      : null;
  },
);

NavigationMenuIndicator.displayName = INDICATOR_NAME;

type NavigationMenuIndicatorImplElement = ElementRef<typeof Norn.div>;
interface NavigationMenuIndicatorImplProps extends NornDivProps {}

const NavigationMenuIndicatorImpl = forwardRef<
  NavigationMenuIndicatorImplElement,
  NavigationMenuIndicatorImplProps
>(
  (
    {
      scopeNavigationMenu,
      ...restProps
    }: ScopedProps<NavigationMenuIndicatorImplProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(
      INDICATOR_NAME,
      scopeNavigationMenu,
    );
    const getItems = useCollection(scopeNavigationMenu);
    const [activeTrigger, setActiveTrigger] =
      useState<NavigationMenuTriggerElement | null>(null);
    const [position, setPosition] = useState<{
      size: number;
      offset: number;
    } | null>(null);
    const isHorizontal = context.orientation === "horizontal";
    const isVisible = Boolean(context.value);

    useEffect(() => {
      const items = getItems();
      const triggerNode = items.find((item) => item.value === context.value)
        ?.ref.current;
      if (triggerNode) setActiveTrigger(triggerNode);
    }, [getItems, context.value]);

    const handlePositionChange = () => {
      if (activeTrigger) {
        setPosition({
          size: isHorizontal
            ? activeTrigger.offsetWidth
            : activeTrigger.offsetHeight,
          offset: isHorizontal
            ? activeTrigger.offsetLeft
            : activeTrigger.offsetTop,
        });
      }
    };
    useResizeObserver(activeTrigger, handlePositionChange);
    useResizeObserver(context.indicatorTrack, handlePositionChange);

    return position ? (
      <Norn.div
        aria-hidden
        data-state={isVisible ? "visible" : "hidden"}
        data-orientation={context.orientation}
        {...restProps}
        ref={forwardedRef}
        style={{
          position: "absolute",
          ...(isHorizontal
            ? {
                left: 0,
                width: position.size + "px",
                transform: `translateX(${position.offset}px)`,
              }
            : {
                top: 0,
                height: position.size + "px",
                transform: `translateY(${position.offset}px)`,
              }),
          ...restProps.style,
        }}
      />
    ) : null;
  },
);

export {NavigationMenuIndicator};
export type {NavigationMenuIndicatorElement, NavigationMenuIndicatorProps};
