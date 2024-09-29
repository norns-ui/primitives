import {focus} from "./focus";

const focusFirst = (candidates: HTMLElement[], {select = false} = {}) => {
  const previouslyFocusedElement = document.activeElement;

  for (const candidate of candidates) {
    // Attempt to focus the candidate
    focus(candidate, {select});

    // If focus has successfully moved to the candidate, exit the loop
    if (
      document.activeElement !== previouslyFocusedElement &&
      document.activeElement === candidate
    ) {
      return false; // Successfully focused a candidate
    }
  }
};

export {focusFirst};
