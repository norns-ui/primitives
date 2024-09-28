import {useComposedRefs} from "@norns-ui/hooks";
import {Children, cloneElement, ReactElement} from "react";

import {getElementRef} from "./getElementRef";
import {usePresence} from "./usePresence";

interface PresenceProps {
  children: ReactElement | ((props: {present: boolean}) => ReactElement);
  present: boolean;
}

const Presence = ({present, children}: PresenceProps) => {
  const presence = usePresence(present);

  const child = (
    typeof children === "function"
      ? children({present: presence.isPresent})
      : Children.only(children)
  ) as ReactElement;

  const ref = useComposedRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? cloneElement(child, {ref}) : null;
};

Presence.displayName = "Presence";

export {Presence};
