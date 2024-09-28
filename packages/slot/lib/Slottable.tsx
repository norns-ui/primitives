/* eslint-disable react/jsx-no-useless-fragment */
import {ReactNode} from "react";

const SLOTTABLE_NAME = "Slottable";

const Slottable = ({children}: {children: ReactNode}) => {
  return <>{children}</>;
};

Slottable.displayName = SLOTTABLE_NAME;

export {Slottable};
