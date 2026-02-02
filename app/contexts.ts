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
  recordId?: number;
  handleDelete?: (recordId: number) => void;
  error?: string | undefined;
  setError?: Dispatch<SetStateAction<string | undefined>>;
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
  setSouth?: Dispatch<SetStateAction<number | undefined>>;
  setNorth?: Dispatch<SetStateAction<number | undefined>>;
  setEast?: Dispatch<SetStateAction<number | undefined>>;
  setWest?: Dispatch<SetStateAction<number | undefined>>;
};

type TStopMapContext = {
  lng: number | undefined;
  lat: number | undefined;
  parkingLat?: number | undefined;
  parkingLng?: number | undefined;
  address?: string | undefined;
  parkingAddress?: string | undefined;
  setLat?: Dispatch<SetStateAction<number | undefined>>;
  setLng?: Dispatch<SetStateAction<number | undefined>>;
  setParkingLat?: Dispatch<SetStateAction<number | undefined>>;
  setParkingLng?: Dispatch<SetStateAction<number | undefined>>;
  setAddress?: Dispatch<SetStateAction<string | undefined>>;
  setParkingAddress?: Dispatch<SetStateAction<string | undefined>>;
  mapIcon: string | undefined;
  iconColor: string | undefined;
  position: number;
  setMapIcon?: Dispatch<SetStateAction<string | undefined>>;
  setIconColor?: Dispatch<SetStateAction<string | undefined>>;
  setPosition?: Dispatch<SetStateAction<number>>;
  stop: TStop;
};

export const RecordContext = createContext<TTourContext>({
  recordId: 0,
  tenant: "",
  recordModel: "tour",
});

export const FormContext = createContext<TFormContext>({
  recordId: 0,
  handleDelete: () => {},
  error: "",
  setError: (_: SetStateAction<string | undefined>) => {},
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
  setSouth: (_: SetStateAction<number | undefined>) => {},
  setNorth: (_: SetStateAction<number | undefined>) => {},
  setEast: (_: SetStateAction<number | undefined>) => {},
  setWest: (_: SetStateAction<number | undefined>) => {},
});

export const StopMapContext = createContext<TStopMapContext | undefined>(
  undefined,
);
