import type { Coordinates, ImageSource, Map } from "maplibre-gl";
import { useEffect } from "react";
import { useTourStore } from "~/store/tourStore";
import type { TMapOverlay } from "~/types";
import { overlayCorners } from "~/utils/overlayGeometry";

const ID = "overlay";

const corners = (overlay: TMapOverlay) =>
  overlayCorners(overlay) as Coordinates;

const MapOverlay = ({ map }: { map: Map }) => {
  const overlay = useTourStore((s) => s.tour?.map_overlay);
  const imageUrl = overlay?.image_url;

  // Add the image once per map and image. Bounds changes move it (below)
  // rather than removing and re-adding the layer, which flashed.
  useEffect(() => {
    if (!map || !imageUrl) return;

    const add = () => {
      const current = useTourStore.getState().tour?.map_overlay;
      if (!current || map.getSource(ID)) return;
      map.addSource(ID, {
        type: "image",
        url: imageUrl,
        coordinates: corners(current),
      });
      map.addLayer({ id: ID, type: "raster", source: ID });
    };

    // Sources can only be added once the style has loaded.
    if (map.isStyleLoaded()) add();
    else map.once("idle", add);

    return () => {
      map.off("idle", add);
      // The map may already have been removed by its owner.
      try {
        if (map.getLayer(ID)) map.removeLayer(ID);
        if (map.getSource(ID)) map.removeSource(ID);
      } catch {
        // Nothing left to clean up.
      }
    };
  }, [map, imageUrl]);

  useEffect(() => {
    if (!overlay) return;
    (map?.getSource(ID) as ImageSource | undefined)?.setCoordinates(
      corners(overlay),
    );
  }, [map, overlay]);

  return <></>;
};

export default MapOverlay;
