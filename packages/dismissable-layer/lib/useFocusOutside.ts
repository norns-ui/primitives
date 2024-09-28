import {useCallbackRef} from "@norns-ui/hooks";
import {useEffect, useRef} from "react";

import {FocusOutsideEvent} from "./DismissableLayer";
import {handleAndDispatchCustomEvent} from "./handleAndDispatchCustomEvent";

const FOCUS_OUTSIDE = "dismissableLayer.focusOutside";

const useFocusOutside = (
  onFocusOutside?: (event: FocusOutsideEvent) => void,
  ownerDocument: Document = globalThis?.document,
) => {
  const handleFocusOutside = useCallbackRef(onFocusOutside) as EventListener;
  const isFocusInsideReactTreeRef = useRef(false);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = {originalEvent: event};
        handleAndDispatchCustomEvent(
          FOCUS_OUTSIDE,
          handleFocusOutside,
          eventDetail,
          {
            discrete: false,
          },
        );
      }
    };
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [ownerDocument, handleFocusOutside]);

  return {
    onFocusCapture: () => {
      isFocusInsideReactTreeRef.current = true;
    },
    onBlurCapture: () => {
      isFocusInsideReactTreeRef.current = false;
    },
  };
};

export {useFocusOutside};
