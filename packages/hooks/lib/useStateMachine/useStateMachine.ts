"use client";

import {useReducer} from "react";

type Machine<S> = {[k: string]: {[k: string]: S}};
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R,
) => any
  ? R
  : never;

const useStateMachine = <M>(
  initialState: MachineState<M>,
  machine: M & Machine<MachineState<M>>,
) => {
  return useReducer(
    (state: MachineState<M>, event: MachineEvent<M>): MachineState<M> => {
      const nextState = (machine[state] as any)[event];
      return nextState ?? state;
    },
    initialState,
  );
};

export {useStateMachine};
