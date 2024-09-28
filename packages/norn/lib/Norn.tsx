import {Slot} from "@norns-ui/slot";
import {
  ComponentPropsWithRef,
  ElementType,
  forwardRef,
  ForwardRefExoticComponent,
} from "react";

const NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "span",
  "svg",
  "ul",
] as const;

type Norns = {[E in (typeof NODES)[number]]: NornForwardRefComponent<E>};
type NornPropsWithRef<E extends ElementType> = ComponentPropsWithRef<E> & {
  asChild?: boolean;
};

interface NornForwardRefComponent<E extends ElementType>
  extends ForwardRefExoticComponent<NornPropsWithRef<E>> {}

const Norn = NODES.reduce((norn, node) => {
  const Node = forwardRef(
    (
      {asChild, ...restProps}: NornPropsWithRef<typeof node>,
      forwardedRef: any,
    ) => {
      const Comp: any = asChild ? Slot : node;

      if (typeof window !== "undefined") {
        (window as any)[Symbol.for("norns-ui")] = true;
      }

      return <Comp {...restProps} ref={forwardedRef} />;
    },
  );

  Node.displayName = `Norn.${node}`;

  return {...norn, [node]: Node};
}, {} as Norns);

export {Norn};
export type {NornPropsWithRef};
