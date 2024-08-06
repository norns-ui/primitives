import {composeRefs} from "@norns-ui/shared";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  ReactNode,
} from "react";
import mergeProps from "./mergeProps";
import getElementRef from "./getElementRef";

const SLOT_CLONE_NAME = "SlotClone";

interface SlotCloneProps {
  children: ReactNode;
}

const SlotClone = forwardRef<any, SlotCloneProps>((props, forwardedRef) => {
  const {children, ...slotProps} = props;

  if (isValidElement(children)) {
    const childrenRef = getElementRef(children);
    return cloneElement(children, {
      ...mergeProps(slotProps, children.props),
      // @ts-ignore
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef,
    });
  }

  return Children.count(children) > 1 ? Children.only(null) : null;
});

SlotClone.displayName = SLOT_CLONE_NAME;

export {SlotClone};
export type {SlotCloneProps};