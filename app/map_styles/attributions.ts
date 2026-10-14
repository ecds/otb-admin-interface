import { baseStyle } from "./base";
import { satellite } from "./satellite";
import type { RasterSourceSpecification } from "maplibre-gl";

export const mapAttributions = [
  "<span>Google, Maxar Technologies.</span>",
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
  ...Object.keys(satellite.sources).map(
    (source) =>
      (satellite.sources[source] as RasterSourceSpecification).attribution,
  ),
  ...Object.keys(baseStyle.sources).map(
    (source) =>
      (baseStyle.sources[source] as RasterSourceSpecification).attribution,
  ),
].filter(Boolean);
