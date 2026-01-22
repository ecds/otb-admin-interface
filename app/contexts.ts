import { createContext } from "react";
import type { TModel, TRelateModel } from "./types";

type TTourContext = {
  recordId: number;
  tenant: string;
  recordModel: TModel;
};

type TFormContext = {
  recordId: number;
  handleDelete: (recordId: number) => void;
};

type TRelatedContext = {
  relatedModel?: TRelateModel;
  relatedType?: "many" | "one";
};

export const RecordContext = createContext<TTourContext>({
  recordId: 0,
  tenant: "",
  recordModel: "tour",
});

export const FormContext = createContext<TFormContext>({
  recordId: 0,
  handleDelete: () => {},
});

export const RelatedContext = createContext<TRelatedContext>({});
