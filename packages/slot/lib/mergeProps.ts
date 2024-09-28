type AnyProps = Record<string, any>;

const mergeProps = (slotProps: AnyProps, childProps: AnyProps) => {
  // all child props should override
  const overrideProps = {...childProps};

  for (const propName in childProps) {
    if (Object.prototype.hasOwnProperty.call(childProps, propName)) {
      const slotPropValue = slotProps[propName];
      const childPropValue = childProps[propName];

      const isHandler = /^on[A-Z]/.test(propName);
      if (isHandler) {
        // if the handler exists on both, we compose them
        if (slotPropValue && childPropValue) {
          overrideProps[propName] = (...args: unknown[]) => {
            childPropValue(...args);
            slotPropValue(...args);
          };
        } else if (slotPropValue) {
          // if it exists only on the slot, we use only this one
          overrideProps[propName] = slotPropValue;
        }
      } else if (propName === "style") {
        // if it's `style`, we merge them
        overrideProps[propName] = {...slotPropValue, ...childPropValue};
      } else if (propName === "className") {
        overrideProps[propName] = [slotPropValue, childPropValue]
          .filter(Boolean)
          .join(" ");
      }
    }
  }

  return {...slotProps, ...overrideProps};
};

export {mergeProps};
