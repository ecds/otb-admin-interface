import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { Map } from "maplibre-gl";
import type { TMapOverlay, TTour } from "~/types";
import MapOverlay from "./MapOverlay";
import { overlayCorners } from "~/utils/overlayGeometry";

const overlay = {
  id: 9,
  image_url: "/o.png",
  north: 2,
  south: 1,
  east: 4,
  west: 3,
} as TMapOverlay;

// Just enough of a MapLibre map to record sources and layers.
const fakeMap = (styleLoaded = true) => {
  const sources: Record<string, { setCoordinates: ReturnType<typeof vi.fn> }> =
    {};
  const layers = new Set<string>();
  const handlers: Record<string, () => void> = {};
  return {
    sources,
    layers,
    fire: (event: string) => handlers[event]?.(),
    isStyleLoaded: () => styleLoaded,
    once: vi.fn((event: string, fn: () => void) => (handlers[event] = fn)),
    off: vi.fn(),
    addSource: vi.fn((id: string) => {
      sources[id] = { setCoordinates: vi.fn() };
    }),
    getSource: (id: string) => sources[id],
    removeSource: vi.fn((id: string) => delete sources[id]),
    addLayer: vi.fn(({ id }: { id: string }) => layers.add(id)),
    getLayer: (id: string) => layers.has(id),
    removeLayer: vi.fn((id: string) => layers.delete(id)),
  };
};

const load = (map_overlay?: TMapOverlay) =>
  useTourStore.getState().setTour({ id: 1, map_overlay } as unknown as TTour);

describe("MapOverlay", () => {
  it("turns the image by the overlay's rotation", () => {
    load({ ...overlay, rotation: 30 });
    const map = fakeMap();
    render(<MapOverlay map={map as unknown as Map} />);
    expect(map.addSource).toHaveBeenCalledWith(
      "overlay",
      expect.objectContaining({
        coordinates: overlayCorners({ ...overlay, rotation: 30 }),
      }),
    );
  });

  beforeEach(() => load(overlay));

  it("adds the image at the overlay's corners", () => {
    const map = fakeMap();
    render(<MapOverlay map={map as unknown as Map} />);
    expect(map.addSource).toHaveBeenCalledWith("overlay", {
      type: "image",
      url: "/o.png",
      coordinates: overlayCorners(overlay),
    });
    expect(map.layers.has("overlay")).toBe(true);
  });

  it("waits for the style before adding the image", () => {
    const map = fakeMap(false);
    render(<MapOverlay map={map as unknown as Map} />);
    expect(map.addSource).not.toHaveBeenCalled();
    map.fire("idle");
    expect(map.addSource).toHaveBeenCalled();
  });

  it("moves the image when the bounds change instead of re-adding it", () => {
    const map = fakeMap();
    render(<MapOverlay map={map as unknown as Map} />);
    act(() =>
      useTourStore
        .getState()
        .updateTourField("map_overlay", { ...overlay, north: 5 }),
    );
    expect(map.addSource).toHaveBeenCalledTimes(1);
    expect(map.removeLayer).not.toHaveBeenCalled();
    expect(map.sources.overlay.setCoordinates).toHaveBeenLastCalledWith(
      overlayCorners({ ...overlay, north: 5 }),
    );
  });

  it("removes the image when the overlay is removed", () => {
    const map = fakeMap();
    render(<MapOverlay map={map as unknown as Map} />);
    act(() =>
      useTourStore.getState().updateTourField("map_overlay", undefined),
    );
    expect(map.layers.has("overlay")).toBe(false);
    expect(map.sources.overlay).toBeUndefined();
  });
});
