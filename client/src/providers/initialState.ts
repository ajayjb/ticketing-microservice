import { User } from "@/types/user";

export type InitialStateType = {
  theme: string;
  user: User | null;
};

export const INITIAL_STATE: InitialStateType = {
  theme: "light",
  user: null,
};
