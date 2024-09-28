/* eslint-disable no-nested-ternary */
"use client";

import {useComposedRefs, useEscapeKeydown} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {composeEventHandlers} from "@norns-ui/shared";
import {
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {dispatchUpdate} from "./dispatchUpdate";
import {useFocusOutside} from "./useFocusOutside";
import {usePointerDownOutside} from "./usePointerDownOutside";

const DISMISSABLE_LAYER_NAME = "DismissableLayer";
const CONTEXT_UPDATE = "dismissableLayer.update";

let originalBodyPointerEvents: string;

const DismissableLayerContext = createContext({
  layers: new Set<DismissableLayerElement>(),
  layersWithOutsidePointerEventsDisabled: new Set<DismissableLayerElement>(),
  branches: new Set<DismissableLayerBranchElement>(),
});

type DismissableLayerElement = ElementRef<typeof Norn.div>;
type NornDivProps = ComponentPropsWithoutRef<typeof Norn.div>;
interface DismissableLayerProps extends NornDivProps {
  /**
   * When `true`, hover/focus/click interactions will be disabled on elements outside
   * the `DismissableLayer`. Users will need to click twice on outside elements to
   * interact with them: once to close the `DismissableLayer`, and again to trigger the element.
   */
  disableOutsidePointerEvents?: boolean;
  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  /**
   * Event handler called when the focus moves outside of the `DismissableLayer`.
   * Can be prevented.
   */
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /**
   * Event handler called when an interaction happens outside the `DismissableLayer`.
   * Specifically, when a `pointerdown` event happens outside or focus moves outside of it.
   * Can be prevented.
   */
  onInteractOutside?: (
    event: PointerDownOutsideEvent | FocusOutsideEvent,
  ) => void;
  /**
   * Handler called when the `DismissableLayer` should be dismissed
   */
  onDismiss?: () => void;
}

const DismissableLayer = forwardRef<
  DismissableLayerElement,
  DismissableLayerProps
>(
  (
    {
      disableOutsidePointerEvents = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...restProps
    },
    forwardedRef,
  ) => {
    const context = useContext(DismissableLayerContext);
    const [node, setNode] = useState<DismissableLayerElement | null>(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = useState({});
    const composedRefs = useComposedRefs(forwardedRef, (node) => setNode(node));
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [
      ...context.layersWithOutsidePointerEventsDisabled,
    ].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = layers.indexOf(
      highestLayerWithOutsidePointerEventsDisabled,
    );
    const index = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled =
      context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled =
      index >= highestLayerWithOutsidePointerEventsDisabledIndex;

    const pointerDownOutside = usePointerDownOutside((event) => {
      const target = event.target as HTMLElement;
      const isPointerDownOnBranch = [...context.branches].some((branch) =>
        branch.contains(target),
      );
      if (!isPointerEventsEnabled || isPointerDownOnBranch) {
        return;
      }
      onPointerDownOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) {
        onDismiss?.();
      }
    }, ownerDocument);

    const focusOutside = useFocusOutside((event) => {
      const target = event.target as HTMLElement;
      const isFocusInBranch = [...context.branches].some((branch) =>
        branch.contains(target),
      );
      if (isFocusInBranch) {
        return;
      }
      onFocusOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) {
        onDismiss?.();
      }
    }, ownerDocument);

    useEscapeKeydown((event: KeyboardEvent) => {
      const isHighestLayer = index === context.layers.size - 1;
      if (!isHighestLayer) {
        return;
      }
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    }, ownerDocument);

    useEffect(() => {
      if (!node) {
        return;
      }
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (
          disableOutsidePointerEvents &&
          context.layersWithOutsidePointerEventsDisabled.size === 1
        ) {
          ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);

    useEffect(() => {
      return () => {
        if (!node) {
          return;
        }
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);

    useEffect(() => {
      const handleUpdate = () => force({});
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);

    return (
      <Norn.div
        {...restProps}
        ref={composedRefs}
        style={{
          pointerEvents: isBodyPointerEventsDisabled
            ? isPointerEventsEnabled
              ? "auto"
              : "none"
            : undefined,
          ...restProps.style,
        }}
        onFocusCapture={composeEventHandlers(
          restProps.onFocusCapture,
          focusOutside.onFocusCapture,
        )}
        onBlurCapture={composeEventHandlers(
          restProps.onBlurCapture,
          focusOutside.onBlurCapture,
        )}
        onPointerDownCapture={composeEventHandlers(
          restProps.onPointerDownCapture,
          pointerDownOutside.onPointerDownCapture,
        )}
      />
    );
  },
);

DismissableLayer.displayName = DISMISSABLE_LAYER_NAME;

const BRANCH_NAME = "DismissableLayerBranch";

type DismissableLayerBranchElement = ElementRef<typeof Norn.div>;
interface DismissableLayerBranchProps extends NornDivProps {}

const DismissableLayerBranch = forwardRef<
  DismissableLayerBranchElement,
  DismissableLayerBranchProps
>((props, forwardedRef) => {
  const context = useContext(DismissableLayerContext);
  const ref = useRef<DismissableLayerBranchElement>(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      context.branches.add(node);
      return () => {
        context.branches.delete(node);
      };
    }
  }, [context.branches]);

  return <Norn.div {...props} ref={composedRefs} />;
});

DismissableLayerBranch.displayName = BRANCH_NAME;

type PointerDownOutsideEvent = CustomEvent<{originalEvent: PointerEvent}>;
type FocusOutsideEvent = CustomEvent<{originalEvent: FocusEvent}>;

export {CONTEXT_UPDATE, DismissableLayer, DismissableLayerBranch};
export type {DismissableLayerProps, FocusOutsideEvent, PointerDownOutsideEvent};
