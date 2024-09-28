import {
  Children,
  cloneElement,
  forwardRef,
  HTMLAttributes,
  isValidElement,
  ReactNode,
} from "react";

import {isSlottable} from "./isSlottable";
import {SlotClone} from "./SlotClone";

const SLOT_NAME = "Slot";

interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const Slot = forwardRef<HTMLElement, SlotProps>(
  ({children, ...restProps}, forwardedRef) => {
    const childrenArray = Children.toArray(children);
    const slottable = childrenArray.find(isSlottable);

    if (slottable) {
      // the new element to render is the one passed as a child of `Slottable`
      const newElement = slottable.props.children as ReactNode;

      const newChildren = childrenArray.map((child) => {
        if (child === slottable) {
          // because the new element will be the one rendered, we are only interested
          // in grabbing its children (`newElement.props.children`)
          if (Children.count(newElement) > 1) {
            return Children.only(null);
          }
          return isValidElement(newElement)
            ? (newElement.props.children as ReactNode)
            : null;
        }
        return child;
      });

      return (
        <SlotClone {...restProps} ref={forwardedRef}>
          {isValidElement(newElement)
            ? cloneElement(newElement, undefined, newChildren)
            : null}
        </SlotClone>
      );
    }

    return (
      <SlotClone {...restProps} ref={forwardedRef}>
        {children}
      </SlotClone>
    );
  },
);

Slot.displayName = SLOT_NAME;

export {Slot};
export type {SlotProps};
