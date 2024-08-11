"use client";

import {ComponentPropsWithoutRef, ElementRef, forwardRef} from "react";
import {useControllableState} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {
  Orientation,
  ScopedProps,
  useNavigationMenuContext,
} from "./NavigationMenu";
import {
  NavigationMenuProvider,
  NavigationMenuProviderPrivateProps,
  NavigationMenuProviderProps,
} from "./NavigationMenuProvider";

const SUB_NAME = "NavigationMenuSub";

type NavigationMenuSubElement = ElementRef<typeof Norn.div>;
type NornDivProps = ComponentPropsWithoutRef<typeof Norn.div>;
interface NavigationMenuSubProps
  extends Omit<
      NavigationMenuProviderProps,
      keyof NavigationMenuProviderPrivateProps
    >,
    NornDivProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
}

const NavigationMenuSub = forwardRef<
  NavigationMenuSubElement,
  NavigationMenuSubProps
>(
  (
    {
      scopeNavigationMenu,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      ...restProps
    }: ScopedProps<NavigationMenuSubProps>,
    forwardedRef,
  ) => {
    const context = useNavigationMenuContext(SUB_NAME, scopeNavigationMenu);
    const [value = "", setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue,
    });

    return (
      <NavigationMenuProvider
        scope={scopeNavigationMenu}
        isRootMenu={false}
        value={value}
        dir={context.dir}
        orientation={orientation}
        rootNavigationMenu={context.rootNavigationMenu}
        onTriggerEnter={(itemValue) => setValue(itemValue)}
        onItemSelect={(itemValue) => setValue(itemValue)}
        onItemDismiss={() => setValue("")}
      >
        <Norn.div
          data-orientation={orientation}
          {...restProps}
          ref={forwardedRef}
        />
      </NavigationMenuProvider>
    );
  },
);

NavigationMenuSub.displayName = SUB_NAME;

export {NavigationMenuSub};
export type {NornDivProps, NavigationMenuSubProps};
