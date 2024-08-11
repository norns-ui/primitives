"use client";

import {ElementRef, forwardRef} from "react";
import {Norn} from "@norns-ui/norn";
import {
  FocusGroupCollection,
  ScopedProps,
  useNavigationMenuContext,
} from "./NavigationMenu";
import {NornDivProps} from "./NavigationMenuSub";

const FOCUS_GROUP_NAME = "FocusGroup";

type FocusGroupElement = ElementRef<typeof Norn.div>;
interface FocusGroupProps extends NornDivProps {}

const FocusGroup = forwardRef<FocusGroupElement, FocusGroupProps>(
  (
    {scopeNavigationMenu, ...restProps}: ScopedProps<FocusGroupProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(
      FOCUS_GROUP_NAME,
      scopeNavigationMenu,
    );

    return (
      <FocusGroupCollection.Provider scope={scopeNavigationMenu}>
        <FocusGroupCollection.Slot scope={scopeNavigationMenu}>
          <Norn.div dir={context.dir} {...restProps} ref={forwardedRef} />
        </FocusGroupCollection.Slot>
      </FocusGroupCollection.Provider>
    );
  },
);

export {FocusGroup};
export type {FocusGroupElement, FocusGroupProps};
