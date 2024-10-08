import {composeRefs, PossibleRef} from "@norns-ui/shared";
import {useCallback} from "react";

/**
 * A hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
const useComposedRefs = <T>(...refs: PossibleRef<T>[]) => {
  return useCallback(composeRefs(...refs), refs);
};

export {useComposedRefs};
