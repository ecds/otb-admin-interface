import { createContext } from "react";
import type {
  TModel,
  TRelateModel,
  TStop,
  TTour,
  TTourSet,
  TTravelMode,
  TUser,
} from "./types";
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

type TRecordContext = {
  recordId: number;
  recordModel: TModel;
  stop?: TStop;
};

type TFormContext = {
  recordId?: number;
  handleDelete?: (recordId: number) => void;
  error?: string | undefined;
  setError?: Dispatch<SetStateAction<string | undefined>>;
};

type TFeedbackMessage = {
  type: "success" | "error";
  message: string;
  dismissable?: boolean;
};

type TFeedbackContext = {
  feedback: TFeedbackMessage | undefined;
  setFeedback: Dispatch<SetStateAction<TFeedbackMessage | undefined>>;
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
  draggable: boolean;
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

export const TourSetContext = createContext<TTourSet>({
  id: 0,
  external_url: "",
  footer_logo: "",
  name: "",
  logo_url: "",
  notes: "",
  subdir: "",
  tours: [],
  admins: [],
  tour_authors: [],
});

export const RecordContext = createContext<TRecordContext>({
  recordId: 0,
  recordModel: "tour",
});

export const FormContext = createContext<TFormContext>({
  recordId: 0,
  handleDelete: async () => {},
  error: "",
  setError: (_: SetStateAction<string | undefined>) => {},
});

export const FeedbackContext = createContext<TFeedbackContext>({
  feedback: { type: "success", message: "" },
  setFeedback: (
    _: SetStateAction<
      { type: "error" | "success"; message: string } | undefined
    >,
  ) => {},
});

export const RelatedContext = createContext<TRelatedContext>({
  relatedModel: "stop",
  relatedType: "one",
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
  draggable: false,
});

export const StopMapContext = createContext<TStopMapContext | undefined>(
  undefined,
);

type TTourContext = {
  tour: TTour;
  modes: TTravelMode[];
  lastUpdated: string | undefined;
  setLastUpdated: Dispatch<SetStateAction<string | undefined>>;
  isSaving: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
};

export const TourContext = createContext<TTourContext>({
  tour: {
    blank_map: false,
    bounds: {
      south: 0,
      north: 0,
      east: 0,
      west: 0,
      centerLat: 0,
      centerLng: 0,
    },
    default_lng: "",
    description: "",
    est_time: "",
    flat_pages: [],
    id: 0,
    map_overlay: {
      id: 0,
      image_url: "",
      east: 0,
      north: 0,
      south: 0,
      west: 0,
      centerLat: 0,
      centerLng: 0,
    },
    map_type: "hybrid",
    media: [],
    mode: { title: "BICYCLING", id: 0 },
    modes: [],
    meta_description: "",
    is_geo: false,
    link_address: "",
    link_text: "",
    location: {
      lat: 0,
      lng: 0,
    },
    published: false,
    restrict_bounds: false,
    restrict_bounds_to_overlay: false,
    slug: "",
    stop_count: 0,
    stops: [],
    tenant: "public",
    tenant_title: "",
    theme: {
      id: 0,
      title: "",
    },
    title: "",
    use_directions: false,
  },
  modes: [],
  lastUpdated: "",
  setLastUpdated: (_: SetStateAction<string | undefined>) => {},
  isSaving: false,
  setIsSaving: (_: SetStateAction<boolean>) => {},
});
