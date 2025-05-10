import { Dispatch } from "react";

import { ActionType } from "./reducer";
import { User } from "@/types/user";
import { LOGIN } from "./actionTypes";

export const login = (dispath: Dispatch<ActionType>, user: User) => {
  return dispath({
    type: LOGIN,
    payload: user,
  });
};
