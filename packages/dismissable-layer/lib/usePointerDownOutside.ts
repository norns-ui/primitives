import {useCallbackRef} from "@norns-ui/hooks";
import {useEffect, useRef} from "react";

import {PointerDownOutsideEvent} from "./DismissableLayer";
import {handleAndDispatchCustomEvent} from "./handleAndDispatchCustomEvent";

const POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";

const usePointerDownOutside = (
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void,
  ownerDocument: Document = globalThis?.document,
) => {
  const handlePointerDownOutside = useCallbackRef(
    onPointerDownOutside,
  ) as EventListener;
  const isPointerInsideReactTreeRef = useRef(false);
  const handleClickRef = useRef(() => {});

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        const eventDetail = {originalEvent: event};

        const handleAndDispatchPointerDownOutsideEvent = () => {
          handleAndDispatchCustomEvent(
            POINTER_DOWN_OUTSIDE,
            handlePointerDownOutside,
            eventDetail,
            {discrete: true},
          );
        };

        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent;
          ownerDocument.addEventListener("click", handleClickRef.current, {
            once: true,
          });
        } else {
          handleAndDispatchPointerDownOutsideEvent();
        }
      } else {
        ownerDocument.removeEventListener("click", handleClickRef.current);
      }
      isPointerInsideReactTreeRef.current = false;
    };
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
    };
  }, [ownerDocument, handlePointerDownOutside]);

  return {
    onPointerDownCapture: () => {
      isPointerInsideReactTreeRef.current = true;
    },
  };
};

export {usePointerDownOutside};
