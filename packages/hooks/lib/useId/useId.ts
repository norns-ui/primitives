"use client";

import React, {useState} from "react";
import {useLayoutEffect} from "~/useLayoutEffect";

const useReactId = (React as any)["useId".toString()] || (() => undefined);
let count = 0;

const useId = (deterministicId?: string): string => {
  const [id, setId] = useState<string | undefined>(useReactId());
  useLayoutEffect(() => {
    if (!deterministicId) {
      setId((reactId) => reactId ?? String(count++));
    }
  }, [deterministicId]);
  return deterministicId || (id ? `redae-${id}` : "");
};

export {useId};
