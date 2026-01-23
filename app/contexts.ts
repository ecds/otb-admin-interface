import { createContext } from "react";
import type { TModel, TRelateModel, TStop, TTour } from "./types";
import type { Dispatch, SetStateAction } from "react";

type TTourContext = {
  recordId: number;
  tenant: string;
  recordModel: TModel;
  tour?: TTour;
  stop?: TStop;
};

type TFormContext = {
  recordId: number;
  handleDelete: (recordId: number) => void;
};

type TRelatedContext = {
  relatedModel: TRelateModel;
  relatedType: "many" | "one";
};

type TOverlayContext = {
  south: number | undefined;
  north: number | undefined;
  east: number | undefined;
  west: number | undefined;
  setSouth: Dispatch<SetStateAction<number | undefined>>;
  setNorth: Dispatch<SetStateAction<number | undefined>>;
  setEast: Dispatch<SetStateAction<number | undefined>>;
  setWest: Dispatch<SetStateAction<number | undefined>>;
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

export const RelatedContext = createContext<TRelatedContext>({
  relatedModel: "tour_medium",
  relatedType: "many",
});

export const OverlayContext = createContext<TOverlayContext>({
  south: 0,
  north: 0,
  east: 0,
  west: 0,
  setSouth: (_: SetStateAction<number | undefined>) => {
    console.error("setSouth not implemented. Did you pass it to context?");
  },
  setNorth: (_: SetStateAction<number | undefined>) => {
    console.error("setNorth not implemented. Did you pass it to context?");
  },
  setEast: (_: SetStateAction<number | undefined>) => {
    console.error("setEast not implemented. Did you pass it to context?");
  },
  setWest: (_: SetStateAction<number | undefined>) => {
    console.error("setWest not implemented. Did you pass it to context?");
  },
});
