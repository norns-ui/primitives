import {Norn} from "@norns-ui/norn";
import {createContextScope, Scope} from "@norns-ui/shared";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useState,
} from "react";

const AVATAR_NAME = "Avatar";

type ScopedProps<P> = P & {scopeAvatar?: Scope};
const [createAvatarContext, createAvatarScope] =
  createContextScope(AVATAR_NAME);

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange(status: ImageLoadingStatus): void;
};

const [AvatarProvider, useAvatarContext] =
  createAvatarContext<AvatarContextValue>(AVATAR_NAME);

type AvatarElement = ElementRef<typeof Norn.span>;
type NornSpanProps = ComponentPropsWithoutRef<typeof Norn.span>;
interface AvatarProps extends NornSpanProps {}

const Avatar = forwardRef<AvatarElement, AvatarProps>(
  ({scopeAvatar, ...restProps}: ScopedProps<AvatarProps>, forwardedRef) => {
    const [imageLoadingStatus, setImageLoadingStatus] =
      useState<ImageLoadingStatus>("idle");
    return (
      <AvatarProvider
        scope={scopeAvatar}
        imageLoadingStatus={imageLoadingStatus}
        onImageLoadingStatusChange={setImageLoadingStatus}
      >
        <Norn.span {...restProps} ref={forwardedRef} />
      </AvatarProvider>
    );
  },
);

Avatar.displayName = AVATAR_NAME;

export {Avatar, createAvatarScope, useAvatarContext};
export type {AvatarElement, AvatarProps, NornSpanProps, ScopedProps};
