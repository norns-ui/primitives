"use client";

import {ElementRef, ComponentPropsWithoutRef, forwardRef} from "react";
import {Norn} from "@norns-ui/norn";
import {FocusGroup} from "./FocusGroup";
import {
  ScopedProps,
  useNavigationMenuContext,
  Collection,
} from "./NavigationMenu";

const LIST_NAME = "NavigationMenuList";

type NavigationMenuListElement = ElementRef<typeof Norn.ul>;
type NornUnorderedListProps = ComponentPropsWithoutRef<typeof Norn.ul>;
interface NavigationMenuListProps extends NornUnorderedListProps {}

const NavigationMenuList = forwardRef<
  NavigationMenuListElement,
  NavigationMenuListProps
>(
  (
    {scopeNavigationMenu, ...restProps}: ScopedProps<NavigationMenuListProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(LIST_NAME, scopeNavigationMenu);

    const list = (
      <Norn.ul
        data-orientation={context.orientation}
        {...restProps}
        ref={forwardedRef}
      />
    );

    return (
      <Norn.div
        style={{position: "relative"}}
        ref={context.onIndicatorTrackChange}
      >
        <Collection.Slot scope={scopeNavigationMenu}>
          {context.isRootMenu ? <FocusGroup asChild>{list}</FocusGroup> : list}
        </Collection.Slot>
      </Norn.div>
    );
  },
);

NavigationMenuList.displayName = LIST_NAME;

export {NavigationMenuList};
export type {
  NavigationMenuListElement,
  NornUnorderedListProps,
  NavigationMenuListProps,
};
