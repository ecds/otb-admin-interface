import { createContext, type Dispatch, type SetStateAction } from "react";
import type { TUser } from "~/types";

interface ISignedIn {
  signedIn: boolean;
  currentUser: TUser | undefined;
  setCurrentUser: Dispatch<SetStateAction<TUser | undefined>>;
}

export const AuthContext = createContext<ISignedIn>({
  signedIn: false,
  currentUser: {
    id: "",
    type: "",
    attributes: {
      display_name: "",
      super: false,
      current_tenant_admin: false,
      provider: "",
      email: "",
      all_tours: [""],
      terms_accepted: false,
    },
  },
  setCurrentUser: (_: SetStateAction<TUser | undefined>) => {
    console.error(
      "setCurrentUser not implemented. Did you pass it to context?"
    );
  },
});
