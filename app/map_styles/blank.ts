import type { StyleSpecification } from "maplibre-gl";

export const blank: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#9a9a9a" },
    },
  ],
};
