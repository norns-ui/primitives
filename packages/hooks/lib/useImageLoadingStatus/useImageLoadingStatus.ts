import {useState} from "react";
import {useLayoutEffect} from "~/useLayoutEffect";

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

const useImageLoadingStatus = (src?: string) => {
  const [loadingStatus, setLoadingStatus] =
    useState<ImageLoadingStatus>("idle");

  useLayoutEffect(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    const updateStatus = (status: ImageLoadingStatus) => () => {
      if (!isMounted) {
        return;
      }
      setLoadingStatus(status);
    };

    setLoadingStatus("loading");
    image.onload = updateStatus("loaded");
    image.onerror = updateStatus("error");
    image.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return loadingStatus;
};

export {useImageLoadingStatus};
export type {ImageLoadingStatus};
