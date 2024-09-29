import {findVisible} from "./findVisible";
import {getTabbableCandidates} from "./getTabbableCandidates";

/**
 * Returns the first and last tabbable elements inside a container.
 */
const getTabbableEdges = (container: HTMLElement) => {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last] as const;
};

export {getTabbableEdges};
