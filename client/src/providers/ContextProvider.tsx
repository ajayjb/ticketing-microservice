"use client"

import React, { useReducer, createContext, Dispatch } from "react";

import { INITIAL_STATE, InitialStateType } from "./initialState";
import { ActionType, reducer } from "./reducer";

type ContextProviderTypes = {
  children: React.ReactNode;
};

export type ContextType = {
  dispatch: Dispatch<ActionType>;
} & InitialStateType;

export const Context = createContext<ContextType | null>(null);

const ContextProvider = (props: ContextProviderTypes) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  return (
    <Context.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;
