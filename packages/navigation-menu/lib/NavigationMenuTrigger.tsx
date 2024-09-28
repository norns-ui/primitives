/* eslint-disable jsx/no-aria-hidden-on-focusable */
"use client";

import {useComposedRefs} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {
  composeEventHandlers,
  getOpenState,
  makeContentId,
  makeTriggerId,
  whenMouse,
} from "@norns-ui/shared";
import {VisuallyHidden} from "@norns-ui/visually-hidden";
import {ComponentPropsWithoutRef, ElementRef, forwardRef, useRef} from "react";

import {FocusGroupItem} from "./FocusGroupItem";
import {
  Collection,
  ScopedProps,
  useNavigationMenuContext,
} from "./NavigationMenu";
import {useNavigationMenuItemContext} from "./NavigationMenuItem";

const TRIGGER_NAME = "NavigationMenuTrigger";

type NavigationMenuTriggerElement = ElementRef<typeof Norn.button>;
type NornButtonProps = ComponentPropsWithoutRef<typeof Norn.button>;
interface NavigationMenuTriggerProps extends NornButtonProps {}

const NavigationMenuTrigger = forwardRef<
  NavigationMenuTriggerElement,
  NavigationMenuTriggerProps
>(
  (
    {
      scopeNavigationMenu,
      disabled,
      ...restProps
    }: ScopedProps<NavigationMenuTriggerProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(TRIGGER_NAME, scopeNavigationMenu);
    const itemContext = useNavigationMenuItemContext(
      TRIGGER_NAME,
      scopeNavigationMenu,
    );
    const ref = useRef<NavigationMenuTriggerElement>(null);
    const composedRefs = useComposedRefs(
      ref,
      itemContext.triggerRef,
      forwardedRef,
    );
    const triggerId = makeTriggerId(context.baseId, itemContext.value);
    const contentId = makeContentId(context.baseId, itemContext.value);
    const hasPointerMoveOpenedRef = useRef(false);
    const wasClickCloseRef = useRef(false);
    const open = itemContext.value === context.value;

    return (
      <>
        <Collection.ItemSlot
          scope={scopeNavigationMenu}
          value={itemContext.value}
        >
          <FocusGroupItem asChild>
            <Norn.button
              id={triggerId}
              disabled={disabled}
              data-disabled={disabled ? "" : undefined}
              data-state={getOpenState(open)}
              aria-expanded={open}
              aria-controls={contentId}
              {...restProps}
              ref={composedRefs}
              onPointerEnter={composeEventHandlers(
                restProps.onPointerEnter,
                () => {
                  wasClickCloseRef.current = false;
                  itemContext.wasEscapeCloseRef.current = false;
                },
              )}
              onPointerMove={composeEventHandlers(
                restProps.onPointerMove,
                whenMouse(() => {
                  if (
                    disabled ||
                    wasClickCloseRef.current ||
                    itemContext.wasEscapeCloseRef.current ||
                    hasPointerMoveOpenedRef.current
                  ) {
                    return;
                  }
                  context.onTriggerEnter(itemContext.value);
                  hasPointerMoveOpenedRef.current = true;
                }),
              )}
              onPointerLeave={composeEventHandlers(
                restProps.onPointerLeave,
                whenMouse(() => {
                  if (disabled) {
                    return;
                  }
                  context.onTriggerLeave();
                  hasPointerMoveOpenedRef.current = false;
                }),
              )}
              onClick={composeEventHandlers(restProps.onClick, () => {
                context.onItemSelect(itemContext.value);
                wasClickCloseRef.current = open;
              })}
              onKeyDown={composeEventHandlers(restProps.onKeyDown, (event) => {
                const verticalEntryKey =
                  context.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
                const entryKey = {
                  horizontal: "ArrowDown",
                  vertical: verticalEntryKey,
                }[context.orientation];
                if (open && event.key === entryKey) {
                  itemContext.onEntryKeyDown();
                  // Prevent FocusGroupItem from handling the event
                  event.preventDefault();
                }
              })}
            />
          </FocusGroupItem>
        </Collection.ItemSlot>
        {open && (
          <>
            <VisuallyHidden
              aria-hidden
              tabIndex={0}
              ref={itemContext.focusProxyRef}
              onFocus={(event) => {
                const content = itemContext.contentRef.current;
                const prevFocusedElement =
                  event.relatedTarget as HTMLElement | null;
                const wasTriggerFocused = prevFocusedElement === ref.current;
                const wasFocusFromContent =
                  content?.contains(prevFocusedElement);

                if (wasTriggerFocused || !wasFocusFromContent) {
                  itemContext.onFocusProxyEnter(
                    wasTriggerFocused ? "start" : "end",
                  );
                }
              }}
            />
            {context.viewport && <span aria-owns={contentId} />}
          </>
        )}
      </>
    );
  },
);

NavigationMenuTrigger.displayName = TRIGGER_NAME;

export {NavigationMenuTrigger};
export type {
  NavigationMenuTriggerElement,
  NavigationMenuTriggerProps,
  NornButtonProps,
};
