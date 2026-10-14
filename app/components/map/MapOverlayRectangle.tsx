import { useEffect, useRef } from "react";
import { useTourStore } from "~/store/tourStore";
import {
  TerraDraw,
  TerraDrawRectangleMode,
  TerraDrawSelectMode,
  type GeoJSONStoreFeatures,
} from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import type { Map } from "maplibre-gl";
import {
  boundsFromCorners,
  overlayCorners,
  type Bounds,
} from "~/utils/overlayGeometry";

const RECT_ID = "32007075-658b-55c9-98d2-4f829c537fae";

type Shape = Bounds & { rotation?: number | null };

// Terra Draw rejects coordinates with too many decimal places.
const round = (n: number) => parseFloat(Number(n).toFixed(5));

const rectangleGeometry = (overlay: Shape) => {
  const ring = overlayCorners(overlay).map(([lng, lat]) => [
    round(lng),
    round(lat),
  ]);
  return { type: "Polygon" as const, coordinates: [[...ring, ring[0]]] };
};

// The upright box Terra Draw's shape stands for at the overlay's rotation.
const boundsOf = (feature: GeoJSONStoreFeatures, rotation = 0) =>
  feature.geometry.type === "Polygon"
    ? boundsFromCorners(feature.geometry.coordinates[0], rotation)
    : undefined;

const sameRing = (a: number[][], b: number[][]) =>
  a.length === b.length &&
  a.every(
    ([lng, lat], i) =>
      Math.abs(lng - b[i][0]) < 1e-5 && Math.abs(lat - b[i][1]) < 1e-5,
  );

type ResizeMode = "opposite" | "opposite-fixed";

// Select mode resizes along the map's axes, which skews a rotated rectangle
// unless both axes scale together, so a rotated overlay can't be stretched.
const selectFlags = (mode: ResizeMode, rotation = 0, draggable = true) => ({
  rectangle: {
    feature: {
      draggable,
      coordinates: {
        resizable: rotation ? ("opposite-fixed" as const) : mode,
        midpoints: false,
        deletable: false,
      },
    },
  },
});

const MapOverlayRectangle = ({
  map,
  mode,
  draggable,
}: {
  map: Map;
  mode: ResizeMode;
  draggable: boolean;
}) => {
  const overlay = useTourStore((s) => s.tour?.map_overlay);
  const updateTourField = useTourStore((s) => s.updateTourField);
  const drawRef = useRef<TerraDraw | undefined>(undefined);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const draggableRef = useRef(draggable);
  draggableRef.current = draggable;
  const overlayId = overlay?.id;
  const rotation = overlay?.rotation ?? 0;

  // One Terra Draw per overlay. Bounds edits don't rebuild it; the effect
  // below moves the existing rectangle instead. The rectangle mode is only
  // registered so the imported feature validates; select mode is the one
  // in use, and there's no toolbar, so nothing new can be drawn.
  useEffect(() => {
    if (!map || !overlayId) return;

    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        // No fill, so the overlay image shows through the rectangle.
        new TerraDrawRectangleMode({ styles: { fillOpacity: 0 } }),
        new TerraDrawSelectMode({
          // Keep the rectangle selected: no clicking it away, no keyboard
          // deselect or delete.
          allowManualDeselection: false,
          styles: { selectedPolygonFillOpacity: 0 },
          keyEvents: null,
          // Read from a ref so toggling doesn't rebuild Terra Draw; the
          // effect further down updates the live instance.
          flags: selectFlags(
            modeRef.current,
            useTourStore.getState().tour?.map_overlay?.rotation ?? 0,
            draggableRef.current,
          ),
        }),
      ],
    });

    draw.on("ready", () => {
      const current = useTourStore.getState().tour?.map_overlay;
      if (!current) return;
      draw.setMode("select");
      const [result] = draw.addFeatures([
        {
          id: RECT_ID,
          type: "Feature",
          properties: { mode: "rectangle" },
          geometry: rectangleGeometry(current),
        },
      ]);
      if (!result?.valid) {
        // addFeatures skips invalid features silently; this says why.
        console.warn("Terra Draw rejected the overlay", result);
        return;
      }
      draw.selectFeature(RECT_ID);
      drawRef.current = draw;
    });

    // Fires once a drag or resize ends. One store update for all four
    // sides; autosave sends it.
    draw.on("finish", (_id, { action }) => {
      if (action !== "dragFeature" && action !== "dragCoordinateResize") return;
      const current = useTourStore.getState().tour?.map_overlay;
      const feature = draw.getSnapshotFeature(RECT_ID);
      const bounds = feature && boundsOf(feature, current?.rotation ?? 0);
      if (!bounds || current?.id !== overlayId) return;
      updateTourField("map_overlay", { ...current, ...bounds });
    });

    // start() adds sources and layers, which throws until the style has
    // loaded. "idle" also covers a style that's still settling after "load".
    let started = false;
    const start = () => {
      started = true;
      draw.start();
    };
    if (map.isStyleLoaded()) start();
    else map.once("idle", start);

    return () => {
      map.off("idle", start);
      drawRef.current = undefined;
      if (!started) return;
      // The map's owner can remove it before this cleanup runs; its layers
      // and sources are gone with it, and stop() would throw clearing them.
      try {
        draw.stop();
      } catch {
        // Nothing left to clean up.
      }
    };
  }, [map, overlayId, updateTourField]);

  // Bounds or rotation changed somewhere else (inputs, a save response), or
  // a resize left a skewed shape: redraw the rectangle unless it's already
  // exactly what the store describes.
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw || !overlay || !draw.hasFeature(RECT_ID)) return;
    const feature = draw.getSnapshotFeature(RECT_ID);
    const expected = rectangleGeometry(overlay);
    if (
      feature?.geometry.type === "Polygon" &&
      sameRing(feature.geometry.coordinates[0], expected.coordinates[0])
    )
      return;
    draw.updateFeatureGeometry(RECT_ID, expected);
  }, [overlay]);

  // Switch how corners resize without recreating Terra Draw.
  useEffect(() => {
    drawRef.current?.updateModeOptions<typeof TerraDrawSelectMode>("select", {
      flags: selectFlags(mode, rotation, draggable),
    });
  }, [mode, rotation, draggable]);

  return <></>;
};

export default MapOverlayRectangle;
