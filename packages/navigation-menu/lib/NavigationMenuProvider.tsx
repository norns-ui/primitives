"use client";

import {Direction, useCallbackRef, useId, usePrevious} from "@norns-ui/hooks";
import {Scope} from "@norns-ui/shared";
import {FC, ReactNode, useCallback, useState} from "react";

import {
  Collection,
  ContentData,
  NavigationMenuElement,
  NavigationMenuProviderImpl,
  Orientation,
  ScopedProps,
  ViewportContentProvider,
} from "./NavigationMenu";
import {NavigationMenuViewportElement} from "./NavigationMenuViewport";

interface NavigationMenuProviderPrivateProps {
  isRootMenu: boolean;
  scope: Scope;
  children: ReactNode;
  orientation: Orientation;
  dir: Direction;
  rootNavigationMenu: NavigationMenuElement | null;
  value: string;
  onTriggerEnter(itemValue: string): void;
  onTriggerLeave?(): void;
  onContentEnter?(): void;
  onContentLeave?(): void;
  onItemSelect(itemValue: string): void;
  onItemDismiss(): void;
}

interface NavigationMenuProviderProps
  extends NavigationMenuProviderPrivateProps {}

const NavigationMenuProvider: FC<NavigationMenuProviderProps> = ({
  scope,
  isRootMenu,
  rootNavigationMenu,
  dir,
  orientation,
  children,
  value,
  onItemSelect,
  onItemDismiss,
  onTriggerEnter,
  onTriggerLeave,
  onContentEnter,
  onContentLeave,
}: ScopedProps<NavigationMenuProviderProps>) => {
  const [viewport, setViewport] =
    useState<NavigationMenuViewportElement | null>(null);
  const [viewportContent, setViewportContent] = useState<
    Map<string, ContentData>
  >(new Map());
  const [indicatorTrack, setIndicatorTrack] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <NavigationMenuProviderImpl
      scope={scope}
      isRootMenu={isRootMenu}
      rootNavigationMenu={rootNavigationMenu}
      value={value}
      previousValue={usePrevious(value)}
      baseId={useId()}
      dir={dir}
      orientation={orientation}
      viewport={viewport}
      onViewportChange={setViewport}
      indicatorTrack={indicatorTrack}
      onIndicatorTrackChange={setIndicatorTrack}
      onTriggerEnter={useCallbackRef(onTriggerEnter)}
      onTriggerLeave={useCallbackRef(onTriggerLeave)}
      onContentEnter={useCallbackRef(onContentEnter)}
      onContentLeave={useCallbackRef(onContentLeave)}
      onItemSelect={useCallbackRef(onItemSelect)}
      onItemDismiss={useCallbackRef(onItemDismiss)}
      onViewportContentChange={useCallback((contentValue, contentData) => {
        setViewportContent((prevContent) => {
          prevContent.set(contentValue, contentData);
          return new Map(prevContent);
        });
      }, [])}
      onViewportContentRemove={useCallback((contentValue) => {
        setViewportContent((prevContent) => {
          if (!prevContent.has(contentValue)) {
            return prevContent;
          }
          prevContent.delete(contentValue);
          return new Map(prevContent);
        });
      }, [])}
    >
      <Collection.Provider scope={scope}>
        <ViewportContentProvider scope={scope} items={viewportContent}>
          {children}
        </ViewportContentProvider>
      </Collection.Provider>
    </NavigationMenuProviderImpl>
  );
};

export {NavigationMenuProvider};
export type {NavigationMenuProviderPrivateProps, NavigationMenuProviderProps};
