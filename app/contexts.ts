import { createContext } from "react";
import type { TAccessRequest, TTourSet, TUser } from "./types";
import type { Dispatch, SetStateAction } from "react";

type ISignedIn = {
  signedIn: boolean;
  currentUser: TUser | undefined;
  setCurrentUser: Dispatch<SetStateAction<TUser | undefined>>;
  currentTenantAdmin: boolean;
  setCurrentTenantAdmin: Dispatch<SetStateAction<boolean>>;
};

export const AuthContext = createContext<ISignedIn>({
  signedIn: false,
  currentUser: undefined,
  setCurrentUser: (_: SetStateAction<TUser | undefined>) => {
    console.error(
      "setCurrentUser not implemented. Did you pass it to context?",
    );
  },
  currentTenantAdmin: false,
  setCurrentTenantAdmin: (_: SetStateAction<boolean>) => {},
});

type TFeedbackMessage = {
  type: "success" | "error";
  message: string;
  dismissable?: boolean;
};

type TFeedbackContext = {
  feedback: TFeedbackMessage | undefined;
  setFeedback: Dispatch<SetStateAction<TFeedbackMessage | undefined>>;
};

type TTourSetContext = {
  tourSet: TTourSet;
  accessRequests: TAccessRequest[];
  accessRequestModalOpen: boolean;
  setAccessRequestModalOpen: Dispatch<SetStateAction<boolean>>;
};

export const TourSetContext = createContext<TTourSetContext>({
  tourSet: {
    id: 0,
    description: "",
    external_url: "",
    footer_logo: "",
    name: "",
    logo_url: "",
    notes: "",
    subdir: "",
    tours: [],
    admins: [],
    tour_authors: [],
  },
  accessRequests: [],
  accessRequestModalOpen: false,
  setAccessRequestModalOpen: (_: SetStateAction<boolean>) => {},
});

export const FeedbackContext = createContext<TFeedbackContext>({
  feedback: { type: "success", message: "" },
  setFeedback: (
    _: SetStateAction<
      { type: "error" | "success"; message: string } | undefined
    >,
  ) => {},
});
