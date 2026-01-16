import { createContext } from "react";

type TTourContext = {
  recordId: number;
  tenant: string;
};

export const RecordContext = createContext<TTourContext>({
  recordId: 0,
  tenant: "",
});
