import { User } from "@/types/user";
import { INITIAL_STATE, InitialStateType } from "./initialState";
import { LOGIN } from "./actionTypes";

export type ActionType = {
  type: string;
  payload: User;
};

export const reducer = (
  state: InitialStateType = INITIAL_STATE,
  action: ActionType
) => {
  switch (action.type) {
    case LOGIN:
      return { ...state, user: action.payload };
    default:
      return state;
  }
};
