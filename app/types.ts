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

type TFlatPage = {
  body: string;
  id: number;
  position: number;
  slug: string;
  title: string;
};

type TMapOverlay = TBounds & {
  image_url: string;
};

export type TModel = "tour" | "stop" | "medium";

export type TRelateModel = "tour_medium" | "stop_medium";

export type TMapType = "hybrid" | "road" | "satellite";

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

type TTravelMode = {
  title: "BICYCLE" | "DRIVING" | "TRANSIT" | "WALKING";
  icon: "bicycle" | "car" | "subway" | "walking";
  default: boolean;
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
  lat: number;
  lng: number;
  map_icon?: string;
};

export type TTour = {
  bounds: TBounds;
  default_lng: string;
  description: string;
  est_time: string;
  flat_pages: TFlatPage[];
  id: number;
  map_overlay: TMapOverlay;
  map_type: TMapType;
  media: TMedium[];
  modes: TTravelMode[];
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
  type: "tour_sets";
  attributes: {
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
  relationships: {
    admins: {
      data: [];
    };
  };
};

export type InputProps = {
  id: string;
  label: string;
  model: string;
  value: string | boolean | number;
  helpText?: string;
};

export type TChoices = {
  value: string;
  label: string;
};
