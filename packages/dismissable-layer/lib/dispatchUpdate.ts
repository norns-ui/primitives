import {CONTEXT_UPDATE} from "./DismissableLayer";

const dispatchUpdate = () => {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
};

export {dispatchUpdate};
