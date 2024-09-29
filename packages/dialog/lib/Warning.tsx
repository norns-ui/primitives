/* eslint-disable no-console */
"use client";

import {createContext} from "@norns-ui/shared";
import {FC, RefObject, useEffect} from "react";

import {CONTENT_NAME, DialogContentElement} from "./DialogContent";
import {TITLE_NAME} from "./DialogTitle";

const TITLE_WARNING_NAME = "DialogTitleWarning";

const [WarningProvider, useWarningContext] = createContext(TITLE_WARNING_NAME, {
  contentName: CONTENT_NAME,
  titleName: TITLE_NAME,
});

type TitleWarningProps = {titleId?: string};

const TitleWarning: FC<TitleWarningProps> = ({titleId}) => {
  const titleWarningContext = useWarningContext(TITLE_WARNING_NAME) as {
    contentName: string;
    titleName: string;
  };

  const MESSAGE = `\`${titleWarningContext.contentName}\` requires a \`${titleWarningContext.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleWarningContext.titleName}\`, you can wrap it with our VisuallyHidden component`;

  useEffect(() => {
    if (titleId) {
      const hasTitle = document.getElementById(titleId);
      if (!hasTitle) {
        console.error(MESSAGE);
      }
    }
  }, [MESSAGE, titleId]);

  return null;
};

const DESCRIPTION_WARNING_NAME = "DialogDescriptionWarning";

type DescriptionWarningProps = {
  contentRef: RefObject<DialogContentElement>;
  descriptionId?: string;
};

const DescriptionWarning: FC<DescriptionWarningProps> = ({
  contentRef,
  descriptionId,
}) => {
  const descriptionWarningContext = useWarningContext(
    DESCRIPTION_WARNING_NAME,
  ) as {
    contentName: string;
    titleName: string;
  };
  const MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${descriptionWarningContext?.contentName}}.`;

  useEffect(() => {
    const describedById = contentRef.current?.getAttribute("aria-describedby");
    // if we have an id and the user hasn't set aria-describedby={undefined}
    if (descriptionId && describedById) {
      const hasDescription = document.getElementById(descriptionId);
      if (!hasDescription) {
        console.warn(MESSAGE);
      }
    }
  }, [MESSAGE, contentRef, descriptionId]);

  return null;
};

export {DescriptionWarning, TitleWarning, WarningProvider};
export type {DescriptionWarningProps, TitleWarningProps};
