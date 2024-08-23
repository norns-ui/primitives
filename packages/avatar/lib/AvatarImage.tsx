import {Norn} from "@norns-ui/norn";
import {forwardRef} from "react";
import {ScopedProps, useAvatarContext} from "./Avatar";
import {
  ImageLoadingStatus,
  useCallbackRef,
  useImageLoadingStatus,
  useLayoutEffect,
} from "@norns-ui/hooks";

const IMAGE_NAME = "AvatarImage";

type AvatarImageElement = React.ElementRef<typeof Norn.img>;
type NornImageProps = React.ComponentPropsWithoutRef<typeof Norn.img>;
interface AvatarImageProps extends NornImageProps {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const AvatarImage = forwardRef<AvatarImageElement, AvatarImageProps>(
  (
    {
      scopeAvatar,
      src,
      onLoadingStatusChange = () => {},
      ...restProps
    }: ScopedProps<AvatarImageProps>,
    forwardedRef,
  ) => {
    const context = useAvatarContext(IMAGE_NAME, scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src);
    const handleLoadingStatusChange = useCallbackRef(
      (status: ImageLoadingStatus) => {
        onLoadingStatusChange(status);
        context.onImageLoadingStatusChange(status);
      },
    );

    useLayoutEffect(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);

    return imageLoadingStatus === "loaded" ? (
      <Norn.img {...restProps} ref={forwardedRef} src={src} />
    ) : null;
  },
);

AvatarImage.displayName = IMAGE_NAME;

export {AvatarImage};
export type {AvatarImageProps};