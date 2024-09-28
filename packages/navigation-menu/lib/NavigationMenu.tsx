"use client";

import {createCollection} from "@norns-ui/collection";
import {
  useComposedRefs,
  useControllableState,
  useDirection,
} from "@norns-ui/hooks";
import {Norn} from "@norns-ui/norn";
import {createContextScope, Scope} from "@norns-ui/shared";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {FocusGroupItemElement} from "./FocusGroupItem";
import {
  ViewportContentMounterElement,
  ViewportContentMounterProps,
} from "./NavigationMenuContent";
import {
  NavigationMenuProvider,
  NavigationMenuProviderPrivateProps,
  NavigationMenuProviderProps,
} from "./NavigationMenuProvider";
import {NavigationMenuTriggerElement} from "./NavigationMenuTrigger";
import {NavigationMenuViewportElement} from "./NavigationMenuViewport";

type Orientation = "vertical" | "horizontal";
type Direction = "ltr" | "rtl";

const NAVIGATION_MENU_NAME = "NavigationMenu";

const [Collection, useCollection, createCollectionScope] = createCollection<
  NavigationMenuTriggerElement,
  {value: string}
>(NAVIGATION_MENU_NAME);

const [
  FocusGroupCollection,
  useFocusGroupCollection,
  createFocusGroupCollectionScope,
] = createCollection<FocusGroupItemElement, {}>(NAVIGATION_MENU_NAME);

type ScopedProps<P> = P & {scopeNavigationMenu?: Scope};
const [createNavigationMenuContext, createNavigationMenuScope] =
  createContextScope(NAVIGATION_MENU_NAME, [
    createCollectionScope,
    createFocusGroupCollectionScope,
  ]);

type ContentData = {
  ref?: Ref<ViewportContentMounterElement>;
} & ViewportContentMounterProps;

type NavigationMenuContextValue = {
  isRootMenu: boolean;
  value: string;
  previousValue: string;
  baseId: string;
  dir: Direction;
  orientation: Orientation;
  rootNavigationMenu: NavigationMenuElement | null;
  indicatorTrack: HTMLDivElement | null;
  onIndicatorTrackChange(indicatorTrack: HTMLDivElement | null): void;
  viewport: NavigationMenuViewportElement | null;
  onViewportChange(viewport: NavigationMenuViewportElement | null): void;
  onViewportContentChange(contentValue: string, contentData: ContentData): void;
  onViewportContentRemove(contentValue: string): void;
  onTriggerEnter(itemValue: string): void;
  onTriggerLeave(): void;
  onContentEnter(): void;
  onContentLeave(): void;
  onItemSelect(itemValue: string): void;
  onItemDismiss(): void;
};

const [NavigationMenuProviderImpl, useNavigationMenuContext] =
  createNavigationMenuContext<NavigationMenuContextValue>(NAVIGATION_MENU_NAME);

const [ViewportContentProvider, useViewportContentContext] =
  createNavigationMenuContext<{
    items: Map<string, ContentData>;
  }>(NAVIGATION_MENU_NAME);

type NavigationMenuElement = ElementRef<typeof Norn.nav>;
type NornNavProps = ComponentPropsWithoutRef<typeof Norn.nav>;
interface NavigationMenuProps
  extends Omit<
      NavigationMenuProviderProps,
      keyof NavigationMenuProviderPrivateProps
    >,
    NornNavProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: Direction;
  orientation?: Orientation;
  delayDuration?: number;
  skipDelayDuration?: number;
}

const NavigationMenu = forwardRef<NavigationMenuElement, NavigationMenuProps>(
  (
    {
      scopeNavigationMenu,
      value: valueProp,
      onValueChange,
      defaultValue,
      delayDuration = 200,
      skipDelayDuration = 300,
      orientation = "horizontal",
      dir,
      ...restProps
    }: ScopedProps<NavigationMenuProps>,
    forwardedRef,
  ) => {
    const [navigationMenu, setNavigationMenu] =
      useState<NavigationMenuElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, (node) =>
      setNavigationMenu(node),
    );
    const direction = useDirection(dir);
    const openTimerRef = useRef(0);
    const closeTimerRef = useRef(0);
    const skipDelayTimerRef = useRef(0);
    const [isOpenDelayed, setIsOpenDelayed] = useState(true);
    const [value = "", setValue] = useControllableState({
      prop: valueProp,
      onChange: (value) => {
        const isOpen = value !== "";
        const hasSkipDelayDuration = skipDelayDuration > 0;

        if (isOpen) {
          window.clearTimeout(skipDelayTimerRef.current);
          if (hasSkipDelayDuration) {
            setIsOpenDelayed(false);
          }
        } else {
          window.clearTimeout(skipDelayTimerRef.current);
          skipDelayTimerRef.current = window.setTimeout(
            () => setIsOpenDelayed(true),
            skipDelayDuration,
          );
        }

        onValueChange?.(value);
      },
      defaultProp: defaultValue,
    });

    const startCloseTimer = useCallback(() => {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => setValue(""), 150);
    }, [setValue]);

    const handleOpen = useCallback(
      (itemValue: string) => {
        window.clearTimeout(closeTimerRef.current);
        setValue(itemValue);
      },
      [setValue],
    );

    const handleDelayedOpen = useCallback(
      (itemValue: string) => {
        const isOpenItem = value === itemValue;
        if (isOpenItem) {
          window.clearTimeout(closeTimerRef.current);
        } else {
          openTimerRef.current = window.setTimeout(() => {
            window.clearTimeout(closeTimerRef.current);
            setValue(itemValue);
          }, delayDuration);
        }
      },
      [value, setValue, delayDuration],
    );

    useEffect(() => {
      return () => {
        window.clearTimeout(openTimerRef.current);
        window.clearTimeout(closeTimerRef.current);
        window.clearTimeout(skipDelayTimerRef.current);
      };
    }, []);

    return (
      <NavigationMenuProvider
        scope={scopeNavigationMenu}
        isRootMenu
        value={value}
        dir={direction}
        orientation={orientation}
        rootNavigationMenu={navigationMenu}
        onTriggerEnter={(itemValue) => {
          window.clearTimeout(openTimerRef.current);
          if (isOpenDelayed) {
            handleDelayedOpen(itemValue);
          } else {
            handleOpen(itemValue);
          }
        }}
        onTriggerLeave={() => {
          window.clearTimeout(openTimerRef.current);
          startCloseTimer();
        }}
        onContentEnter={() => window.clearTimeout(closeTimerRef.current)}
        onContentLeave={startCloseTimer}
        onItemSelect={(itemValue) => {
          setValue((prevValue) => (prevValue === itemValue ? "" : itemValue));
        }}
        onItemDismiss={() => setValue("")}
      >
        <Norn.nav
          aria-label="Main"
          data-orientation={orientation}
          dir={direction}
          {...restProps}
          ref={composedRef}
        />
      </NavigationMenuProvider>
    );
  },
);

NavigationMenu.displayName = NAVIGATION_MENU_NAME;

export {
  Collection,
  createCollectionScope,
  createFocusGroupCollectionScope,
  createNavigationMenuContext,
  createNavigationMenuScope,
  FocusGroupCollection,
  NavigationMenu,
  NavigationMenuProviderImpl,
  useCollection,
  useFocusGroupCollection,
  useNavigationMenuContext,
  useViewportContentContext,
  ViewportContentProvider,
};
export type {
  ContentData,
  NavigationMenuElement,
  NavigationMenuProps,
  Orientation,
  ScopedProps,
};
