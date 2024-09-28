"use client";

import {useEffect} from "react";

/** Number of components which have requested interest to have focus guards */
let count = 0;

const createFocusGuard = () => {
  const element = document.createElement("span");
  element.setAttribute("data-norns-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
};

/**
 * Injects a pair of focus guards at the edges of the whole DOM tree
 * to ensure `focusin` & `focusout` events can be caught consistently.
 */
const useFocusGuards = () => {
  useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-norns-focus-guard]");
    document.body.insertAdjacentElement(
      "afterbegin",
      edgeGuards[0] ?? createFocusGuard(),
    );
    document.body.insertAdjacentElement(
      "beforeend",
      edgeGuards[1] ?? createFocusGuard(),
    );
    count++;

    return () => {
      if (count === 1) {
        document
          .querySelectorAll("[data-norns-focus-guard]")
          .forEach((node) => node.remove());
      }
      count--;
    };
  }, []);
};

const FocusGuards = (props: any) => {
  useFocusGuards();
  return props.children;
};

export {FocusGuards, useFocusGuards};
