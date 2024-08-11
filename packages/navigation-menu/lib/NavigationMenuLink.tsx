"use client";

import {FocusGroupItem} from "./FocusGroupItem";
import {
  dispatchDiscreteCustomEvent,
  composeEventHandlers,
} from "@norns-ui/shared";
import {Norn} from "@norns-ui/norn";
import {ROOT_CONTENT_DISMISS} from "./NavigationMenuContent";
import {ScopedProps} from "./NavigationMenu";
import {ElementRef, ComponentPropsWithoutRef, forwardRef} from "react";

const LINK_NAME = "NavigationMenuLink";
const LINK_SELECT = "navigationMenu.linkSelect";

type NavigationMenuLinkElement = ElementRef<typeof Norn.a>;
type NornLinkProps = ComponentPropsWithoutRef<typeof Norn.a>;
interface NavigationMenuLinkProps extends Omit<NornLinkProps, "onSelect"> {
  active?: boolean;
  onSelect?: (event: Event) => void;
}

const NavigationMenuLink = forwardRef<
  NavigationMenuLinkElement,
  NavigationMenuLinkProps
>(
  (
    {
      scopeNavigationMenu,
      active,
      onSelect,
      ...restProps
    }: ScopedProps<NavigationMenuLinkProps>,
    forwardedRef,
  ) => {
    return (
      <FocusGroupItem asChild>
        <Norn.a
          data-active={active ? "" : undefined}
          aria-current={active ? "page" : undefined}
          {...restProps}
          ref={forwardedRef}
          onClick={composeEventHandlers(
            restProps.onClick,
            (event) => {
              const target = event.target as HTMLElement;
              const linkSelectEvent = new CustomEvent(LINK_SELECT, {
                bubbles: true,
                cancelable: true,
              });
              target.addEventListener(
                LINK_SELECT,
                (event) => onSelect?.(event),
                {
                  once: true,
                },
              );
              dispatchDiscreteCustomEvent(target, linkSelectEvent);

              if (!linkSelectEvent.defaultPrevented && !event.metaKey) {
                const rootContentDismissEvent = new CustomEvent(
                  ROOT_CONTENT_DISMISS,
                  {
                    bubbles: true,
                    cancelable: true,
                  },
                );
                dispatchDiscreteCustomEvent(target, rootContentDismissEvent);
              }
            },
            {checkForDefaultPrevented: false},
          )}
        />
      </FocusGroupItem>
    );
  },
);

NavigationMenuLink.displayName = LINK_NAME;

export {NavigationMenuLink};
export type {NavigationMenuLinkElement, NornLinkProps, NavigationMenuLinkProps};
