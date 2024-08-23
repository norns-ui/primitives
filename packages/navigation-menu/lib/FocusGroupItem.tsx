"use client";

import {ElementRef, forwardRef} from "react";
import {Norn} from "@norns-ui/norn";
import {
  FocusGroupCollection,
  ScopedProps,
  useFocusGroupCollection,
  useNavigationMenuContext,
} from "./NavigationMenu";
import {NornButtonProps} from "./NavigationMenuTrigger";
import {composeEventHandlers, focusFirst} from "@norns-ui/shared";

const ARROW_KEYS = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"];
const FOCUS_GROUP_ITEM_NAME = "FocusGroupItem";

type FocusGroupItemElement = ElementRef<typeof Norn.button>;
interface FocusGroupItemProps extends NornButtonProps {}

const FocusGroupItem = forwardRef<FocusGroupItemElement, FocusGroupItemProps>(
  (
    {scopeNavigationMenu, ...restProps}: ScopedProps<FocusGroupItemProps>,
    forwardedRef,
  ) => {
    const getItems = useFocusGroupCollection(scopeNavigationMenu);
    const context = useNavigationMenuContext(
      FOCUS_GROUP_ITEM_NAME,
      scopeNavigationMenu,
    );

    return (
      <FocusGroupCollection.ItemSlot scope={scopeNavigationMenu}>
        <Norn.button
          {...restProps}
          ref={forwardedRef}
          onKeyDown={composeEventHandlers(restProps.onKeyDown, (event) => {
            const isFocusNavigationKey = [
              "Home",
              "End",
              ...ARROW_KEYS,
            ].includes(event.key);
            if (isFocusNavigationKey) {
              let candidateNodes = getItems().map((item) => item.ref.current!);
              const prevItemKey =
                context.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
              const prevKeys = [prevItemKey, "ArrowUp", "End"];
              if (prevKeys.includes(event.key)) candidateNodes.reverse();
              if (ARROW_KEYS.includes(event.key)) {
                const currentIndex = candidateNodes.indexOf(
                  event.currentTarget,
                );
                candidateNodes = candidateNodes.slice(currentIndex + 1);
              }
              /**
               * Imperative focus during keydown is risky so we prevent React's batching updates
               * to avoid potential bugs. See: https://github.com/facebook/react/issues/20332
               */
              setTimeout(() => focusFirst(candidateNodes));

              // Prevent page scroll while navigating
              event.preventDefault();
            }
          })}
        />
      </FocusGroupCollection.ItemSlot>
    );
  },
);

export {FocusGroupItem};
export type {FocusGroupItemElement, FocusGroupItemProps};
