import type { StyleSpecification } from "maplibre-gl";

export const satellite: StyleSpecification = {
  version: 8,
  name: "orto",
  metadata: {},
  center: [1.537786, 41.837539],
  zoom: 12,
  bearing: 0,
  pitch: 0,
  light: {
    anchor: "viewport",
    color: "white",
    intensity: 0.4,
    position: [1.15, 45, 30],
  },
  sources: {
    ortoEsri: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      // scheme: "tms",
      tileSize: 256,
      maxzoom: 19,
      attribution: "ESRI &copy; <a href='http://www.esri.com'>ESRI</a>",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#F4F9F4",
      },
    },
    {
      id: "ortoEsri",
      type: "raster",
      source: "ortoEsri",
      layout: {
        visibility: "visible",
      },
    },
  ],
};
