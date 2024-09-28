"use client";

import {useId} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {
  focusFirst,
  getTabbableCandidates,
  removeFromTabOrder,
} from "@norns-ui/shared";
import {VisuallyHidden} from "@norns-ui/visually-hidden";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  MutableRefObject,
  RefObject,
  useCallback,
  useRef,
} from "react";

import {ScopedProps} from "./NavigationMenu";
import {createNavigationMenuContext} from "./NavigationMenu";
import {NavigationMenuContentElement} from "./NavigationMenuContent";
import {NavigationMenuTriggerElement} from "./NavigationMenuTrigger";

const ITEM_NAME = "NavigationMenuItem";

type FocusProxyElement = ElementRef<typeof VisuallyHidden>;

type NavigationMenuItemContextValue = {
  value: string;
  triggerRef: RefObject<NavigationMenuTriggerElement>;
  contentRef: RefObject<NavigationMenuContentElement>;
  focusProxyRef: RefObject<FocusProxyElement>;
  wasEscapeCloseRef: MutableRefObject<boolean>;
  onEntryKeyDown(): void;
  onFocusProxyEnter(side: "start" | "end"): void;
  onRootContentClose(): void;
  onContentFocusOutside(): void;
};

const [NavigationMenuItemContextProvider, useNavigationMenuItemContext] =
  createNavigationMenuContext<NavigationMenuItemContextValue>(ITEM_NAME);

type NavigationMenuItemElement = ElementRef<typeof Norn.li>;
type NornListItemProps = ComponentPropsWithoutRef<typeof Norn.li>;
interface NavigationMenuItemProps extends NornListItemProps {
  value?: string;
}

const NavigationMenuItem = forwardRef<
  NavigationMenuItemElement,
  NavigationMenuItemProps
>(
  (
    {
      scopeNavigationMenu,
      value: valueProp,
      ...restProps
    }: ScopedProps<NavigationMenuItemProps>,
    forwardedRef,
  ) => {
    const autoValue = useId();
    // We need to provide an initial deterministic value as `useId` will return
    // empty string on the first render and we don't want to match our internal "closed" value.
    const value = valueProp || autoValue || "LEGACY_REACT_AUTO_VALUE";
    const contentRef = useRef<NavigationMenuContentElement>(null);
    const triggerRef = useRef<NavigationMenuTriggerElement>(null);
    const focusProxyRef = useRef<FocusProxyElement>(null);
    const restoreContentTabOrderRef = useRef(() => {});
    const wasEscapeCloseRef = useRef(false);

    const handleContentEntry = useCallback((side = "start") => {
      if (contentRef.current) {
        restoreContentTabOrderRef.current();
        const candidates = getTabbableCandidates(contentRef.current);
        if (candidates.length) {
          focusFirst(side === "start" ? candidates : candidates.reverse());
        }
      }
    }, []);

    const handleContentExit = useCallback(() => {
      if (contentRef.current) {
        const candidates = getTabbableCandidates(contentRef.current);
        if (candidates.length) {
          restoreContentTabOrderRef.current = removeFromTabOrder(candidates);
        }
      }
    }, []);

    return (
      <NavigationMenuItemContextProvider
        scope={scopeNavigationMenu}
        value={value}
        triggerRef={triggerRef}
        contentRef={contentRef}
        focusProxyRef={focusProxyRef}
        wasEscapeCloseRef={wasEscapeCloseRef}
        onEntryKeyDown={handleContentEntry}
        onFocusProxyEnter={handleContentEntry}
        onRootContentClose={handleContentExit}
        onContentFocusOutside={handleContentExit}
      >
        <Norn.li {...restProps} ref={forwardedRef} />
      </NavigationMenuItemContextProvider>
    );
  },
);

NavigationMenuItem.displayName = ITEM_NAME;

export {
  NavigationMenuItem,
  NavigationMenuItemContextProvider,
  useNavigationMenuItemContext,
};
export type {FocusProxyElement, NavigationMenuItemProps};
