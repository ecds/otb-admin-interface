import type { ReactNode } from "react";

export type TUser = {
  id: string;
  type: string;
  attributes: {
    display_name: string;
    super: boolean;
    current_tenant_admin: boolean;
    provider: string;
    email: string;
    all_tours: string[];
    terms_accepted: boolean;
  };
};

export type TTourAttributes = {
  default_lng: string;
  description: string;
  meta_description: string;
  is_geo: boolean;
  link_address: string;
  link_text: string;
  location: {
    lat: number;
    lng: number;
  };
  published: boolean;
  restrict_bounds: boolean;
  slug: string;
  tenant: string;
  title: string;
  use_directions: boolean;
};

type TBounds = {
  south: number;
  north: number;
  east: number;
  west: number;
  centerLat: number;
  centerLng: number;
};

export type TFlatPage = {
  body: string;
  id: number;
  orphaned: true;
  position: number;
  relation_id: number;
  slug: string;
  title: string;
  tour_count: number;
};

export type TMapOverlay = TBounds & {
  id: number;
  image_url: string;
};

export type TModel = "tour" | "stop" | "medium" | "flat_page";

export type TRelateModel =
  | "tour_flat_page"
  | "tour_stop"
  | "tour_medium"
  | "tour_mode"
  | "stop_medium"
  | "map_overlay"
  | "map_icon"
  | "stop";

export type TMapType = "hybrid" | "roadmap" | "satellite" | "terrain";

export type TMedium = {
  caption: string;
  desktop_width: number;
  embed?: string;
  filename: string;
  files: {
    original: string;
    mobile: string;
    tablet: string;
    desktop: string;
    lqip: string;
  };
  id: number;
  lqip?: number;
  mobile_width: number;
  original_image: string;
  position: number;
  provider?: "youtube" | "vimeo" | "soundcloud";
  relation_id: number;
  tablet_width: number;
  title: string;
  video?: string;
};

export type TTravelModeTitle = "BICYCLING" | "DRIVING" | "TRANSIT" | "WALKING";

export type TTravelMode = {
  id: number;
  title: TTravelModeTitle;
};

export type TTourTravelMode = TTravelMode & {
  relation_id: number;
};

export type TStop = {
  next: {
    id: number;
    slug: string;
    title: string;
  };
  position: number;
  previous: {
    id: number;
    slug: string;
    title: string;
  };
  address: string;
  article_link?: string;
  description: string;
  direction_intro?: string;
  direction_notes?: string;
  icon?: string;
  icon_color: string;
  id: number;
  lat: number;
  lng: number;
  map_icon?: string;
  media: TMedium[];
  meta_description: string;
  orphaned: boolean;
  parking_address: string | undefined;
  parking_lat: number | undefined;
  parking_lng: number | undefined;
  relation_id: number;
  slug: string;
  title: string;
  tour_count: number;
};

export type TTour = {
  blank_map: boolean;
  bounds: TBounds;
  default_lng: string;
  description: string;
  est_time: string;
  flat_pages: TFlatPage[];
  id: number;
  map_overlay: TMapOverlay;
  map_type: TMapType;
  media: TMedium[];
  mode: TTravelMode;
  modes: TTourTravelMode[];
  meta_description: string;
  is_geo: boolean;
  link_address: string;
  link_text: string;
  location: {
    lat: number;
    lng: number;
  };
  published: boolean;
  restrict_bounds: boolean;
  restrict_bounds_to_overlay: boolean;
  slug: string;
  stop_count: number;
  stops: TStop[];
  tenant: string;
  tenant_title: string;
  theme: {
    id: number;
    title: string;
  };
  title: string;
  use_directions: boolean;
};

export type TTourSet = {
  id: string;
  name: string;
  subdir: string;
  published_tours: TTourAttributes[];
  mapable_tours: TTourAttributes[];
  logo_url: null;
  logo: {
    name: string;
    record: {
      id: number;
      name: string;
      created_at: string;
      updated_at: string;
      subdir: string;
      tour_id: null;
      external_url: null;
      notes: null;
      footer_logo: null;
      base_sixty_four: null;
      logo_title: null;
    };
  };
};

export type InputProps = {
  id: TValue;
  label: string | ReactNode;
  model: string;
  value: string | boolean | number;
  helpText?: string;
  onChange?: (value: string) => void;
};

export type TChoices = {
  value: string;
  label: string;
};

export type TEmbedProvider = "vimeo" | "youtube" | "soundcloud";

export type TServerResponse = TTour | TStop | TMedium | TFlatPage;

export type TSelectableProps =
  | "blank_map"
  | "default_lng"
  | "is_geo"
  | "map_type"
  | "published"
  | "restrict_bounds"
  | "restrict_bounds_to_overlay"
  | "use_directions";

export type TValue =
  | TSelectableProps
  | "address"
  | "body"
  | "caption"
  | "description"
  | "direction_notes"
  | "east"
  | "embed"
  | "icon"
  | "icon_color"
  | "id"
  | "lat"
  | "link_address"
  | "link_text"
  | "lng"
  | "meta_description"
  | "north"
  | "parking_address"
  | "parking_lat"
  | "parking_lng"
  | "south"
  | "title"
  | "use_directions"
  | "west";

export type TV3MapIcon = {
  id: number;
  attributes: {
    original_image_url: string;
  };
};

export type TV3MapIconResponse = {
  data: TV3MapIcon[];
};
