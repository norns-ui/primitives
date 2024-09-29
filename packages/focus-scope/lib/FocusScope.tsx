/* eslint-disable react/no-this-in-sfc */
"use client";

import {useCallbackRef, useComposedRefs} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {
  focus,
  focusFirst,
  getTabbableCandidates,
  getTabbableEdges,
} from "@norns-ui/shared";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {focusScopesStack, removeLinks} from "./FocusScopeStack";

const AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
const AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
const EVENT_OPTIONS = {bubbles: false, cancelable: true};

const FOCUS_SCOPE_NAME = "FocusScope";

type FocusScopeElement = ElementRef<typeof Norn.div>;
type NornDivProps = ComponentPropsWithoutRef<typeof Norn.div>;
interface FocusScopeProps extends NornDivProps {
  /**
   * When `true`, tabbing from last item will focus first tabbable
   * and shift+tab from first item will focus last tababble.
   * @defaultValue false
   */
  loop?: boolean;

  /**
   * When `true`, focus cannot escape the focus scope via keyboard,
   * pointer, or a programmatic focus.
   * @defaultValue false
   */
  trapped?: boolean;

  /**
   * Event handler called when auto-focusing on mount.
   * Can be prevented.
   */
  onMountAutoFocus?: (event: Event) => void;

  /**
   * Event handler called when auto-focusing on unmount.
   * Can be prevented.
   */
  onUnmountAutoFocus?: (event: Event) => void;
}

const FocusScope = forwardRef<FocusScopeElement, FocusScopeProps>(
  (
    {
      loop = false,
      trapped = false,
      onMountAutoFocus: onMountAutoFocusProp,
      onUnmountAutoFocus: onUnmountAutoFocusProp,
      ...scopeProps
    },
    forwardedRef,
  ) => {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
    const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
    const lastFocusedElementRef = useRef<HTMLElement | null>(null);
    const composedRefs = useComposedRefs(forwardedRef, (node) =>
      setContainer(node),
    );

    const focusScope = useRef({
      paused: false,
      pause() {
        this.paused = true;
      },
      resume() {
        this.paused = false;
      },
    }).current;

    // Takes care of trapping focus if focus is moved outside programmatically for example
    useEffect(() => {
      if (trapped) {
        function handleFocusIn(event: FocusEvent) {
          if (focusScope.paused || !container) {
            return;
          }
          const target = event.target as HTMLElement | null;
          if (container.contains(target)) {
            lastFocusedElementRef.current = target;
          } else {
            focus(lastFocusedElementRef.current, {select: true});
          }
        }

        function handleFocusOut(event: FocusEvent) {
          if (focusScope.paused || !container) {
            return;
          }
          const relatedTarget = event.relatedTarget as HTMLElement | null;

          // A `focusout` event with a `null` `relatedTarget` will happen in at least two cases:
          //
          // 1. When the user switches app/tabs/windows/the browser itself loses focus.
          // 2. In Google Chrome, when the focused element is removed from the DOM.
          //
          // We let the browser do its thing here because:
          //
          // 1. The browser already keeps a memory of what's focused for when the page gets refocused.
          // 2. In Google Chrome, if we try to focus the deleted focused element (as per below), it
          //    throws the CPU to 100%, so we avoid doing anything for this reason here too.
          if (relatedTarget === null) {
            return;
          }

          // If the focus has moved to an actual legitimate element (`relatedTarget !== null`)
          // that is outside the container, we move focus to the last valid focused element inside.
          if (!container.contains(relatedTarget)) {
            focus(lastFocusedElementRef.current, {select: true});
          }
        }

        // When the focused element gets removed from the DOM, browsers move focus
        // back to the document.body. In this case, we move focus to the container
        // to keep focus trapped correctly.
        function handleMutations(mutations: MutationRecord[]) {
          const focusedElement = document.activeElement as HTMLElement | null;
          if (focusedElement !== document.body) {
            return;
          }
          for (const mutation of mutations) {
            if (mutation.removedNodes.length > 0) {
              focus(container);
            }
          }
        }

        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);
        const mutationObserver = new MutationObserver(handleMutations);
        if (container) {
          mutationObserver.observe(container, {childList: true, subtree: true});
        }

        return () => {
          document.removeEventListener("focusin", handleFocusIn);
          document.removeEventListener("focusout", handleFocusOut);
          mutationObserver.disconnect();
        };
      }
    }, [trapped, container, focusScope.paused]);

    useEffect(() => {
      if (container) {
        focusScopesStack.add(focusScope);
        const previouslyFocusedElement =
          document.activeElement as HTMLElement | null;
        const hasFocusedCandidate = container.contains(
          previouslyFocusedElement,
        );

        if (!hasFocusedCandidate) {
          const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          container.dispatchEvent(mountEvent);
          if (!mountEvent.defaultPrevented) {
            focusFirst(removeLinks(getTabbableCandidates(container)), {
              select: true,
            });
            if (document.activeElement === previouslyFocusedElement) {
              focus(container);
            }
          }
        }

        return () => {
          container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);

          // We hit a react bug (fixed in v17) with focusing in unmount.
          // We need to delay the focus a little to get around it for now.
          // See: https://github.com/facebook/react/issues/17894
          setTimeout(() => {
            const unmountEvent = new CustomEvent(
              AUTOFOCUS_ON_UNMOUNT,
              EVENT_OPTIONS,
            );
            container.addEventListener(
              AUTOFOCUS_ON_UNMOUNT,
              onUnmountAutoFocus,
            );
            container.dispatchEvent(unmountEvent);
            if (!unmountEvent.defaultPrevented) {
              focus(previouslyFocusedElement ?? document.body, {select: true});
            }
            // we need to remove the listener after we `dispatchEvent`
            container.removeEventListener(
              AUTOFOCUS_ON_UNMOUNT,
              onUnmountAutoFocus,
            );

            focusScopesStack.remove(focusScope);
          }, 0);
        };
      }
    }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);

    // Takes care of looping focus (when tabbing whilst at the edges)
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (!loop && !trapped) {
          return;
        }
        if (focusScope.paused) {
          return;
        }

        const isTabKey =
          event.key === "Tab" &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey;
        const focusedElement = document.activeElement as HTMLElement | null;

        if (isTabKey && focusedElement) {
          const container = event.currentTarget as HTMLElement;
          const [first, last] = getTabbableEdges(container);
          const hasTabbableElementsInside = first && last;

          // we can only wrap focus if we have tabbable edges
          if (!hasTabbableElementsInside) {
            if (focusedElement === container) {
              event.preventDefault();
            }
          } else {
            if (!event.shiftKey && focusedElement === last) {
              event.preventDefault();
              if (loop) {
                focus(first, {select: true});
              }
            } else if (event.shiftKey && focusedElement === first) {
              event.preventDefault();
              if (loop) {
                focus(last, {select: true});
              }
            }
          }
        }
      },
      [loop, trapped, focusScope.paused],
    );

    return (
      <Norn.div
        tabIndex={-1}
        {...scopeProps}
        ref={composedRefs}
        onKeyDown={handleKeyDown}
      />
    );
  },
);

FocusScope.displayName = FOCUS_SCOPE_NAME;

export {FocusScope};
export type {FocusScopeProps};
