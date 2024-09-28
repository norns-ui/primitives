import {useStateMachine} from "@norns-ui/hooks";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {flushSync} from "react-dom";

const getAnimationName = (styles?: CSSStyleDeclaration) => {
  return styles?.animationName || "none";
};

const usePresence = (present: boolean) => {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const stylesRef = useRef<CSSStyleDeclaration>({} as any);
  const prevPresentRef = useRef(present);
  const prevAnimationNameRef = useRef<string>("none");
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended",
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted",
    },
    unmounted: {
      MOUNT: "mounted",
    },
  });

  useEffect(() => {
    const currentAnimationName = getAnimationName(stylesRef.current);
    prevAnimationNameRef.current =
      state === "mounted" ? currentAnimationName : "none";
  }, [state]);

  useLayoutEffect(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;

    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);

      if (present) {
        send("MOUNT");
      } else if (
        currentAnimationName === "none" ||
        styles?.display === "none"
      ) {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;

        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }

      prevPresentRef.current = present;
    }
  }, [present, send]);

  useLayoutEffect(() => {
    if (node) {
      const handleAnimationEnd = (event: AnimationEvent) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(
          event.animationName,
        );
        if (event.target === node && isCurrentAnimation) {
          flushSync(() => send("ANIMATION_END"));
        }
      };
      const handleAnimationStart = (event: AnimationEvent) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    }
    send("ANIMATION_END");
  }, [node, send]);

  const setRef = useCallback((node: HTMLElement | null) => {
    if (node !== null) {
      stylesRef.current = getComputedStyle(node);
    }
    setNode(node);
  }, []);

  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: setRef,
  };
};

export {usePresence};
