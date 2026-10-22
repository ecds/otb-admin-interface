import { baseStyle, blank, hybrid, satellite } from "~/map_styles";
import type { TTour } from "~/types";

// The base map for a tour's settings: a blank map wins over the map type.
export const mapStyleFor = (
  mapType: TTour["map_type"] | undefined,
  blankMap: boolean | undefined,
) => {
  if (blankMap) return blank;
  switch (mapType) {
    case "satellite":
      return satellite;
    case "hybrid":
      return hybrid;
    default:
      return baseStyle;
  }
};
