import {dispatchDiscreteCustomEvent} from "@norns-ui/shared";

const handleAndDispatchCustomEvent = <
  E extends CustomEvent,
  OriginalEvent extends Event,
>(
  name: string,
  handler: ((event: E) => void) | undefined,
  detail: {originalEvent: OriginalEvent} & (E extends CustomEvent<infer D>
    ? D
    : never),
  {discrete}: {discrete: boolean},
) => {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, {
    bubbles: false,
    cancelable: true,
    detail,
  });
  if (handler) {
    target.addEventListener(name, handler as EventListener, {once: true});
  }

  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    target.dispatchEvent(event);
  }
};

export {handleAndDispatchCustomEvent};
