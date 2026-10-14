import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { Map } from "maplibre-gl";
import type { TMapOverlay, TTour } from "~/types";

// A stand-in for Terra Draw that records calls and lets tests fire its
// events. The real one needs a WebGL map.
const { FakeDraw, draws } = vi.hoisted(() => {
  type Handler = (...args: unknown[]) => void;
  const draws: FakeDraw[] = [];
  class FakeDraw {
    handlers: Record<string, Handler> = {};
    feature: { geometry: { type: string; coordinates: number[][][] } } | null =
      null;
    options: { modes: { options?: { flags?: unknown } }[] };
    start = vi.fn(() => this.handlers.ready?.());
    stop = vi.fn();
    setMode = vi.fn();
    selectFeature = vi.fn();
    updateModeOptions = vi.fn();
    updateFeatureGeometry = vi.fn();
    constructor(options: FakeDraw["options"]) {
      this.options = options;
      draws.push(this);
    }
    on(event: string, fn: Handler) {
      this.handlers[event] = fn;
    }
    addFeatures([feature]: [FakeDraw["feature"] & { id: string }]) {
      this.feature = feature;
      return [{ id: feature!.id, valid: true }];
    }
    hasFeature = () => this.feature !== null;
    getSnapshotFeature = () => this.feature;
  }
  return { FakeDraw, draws };
});

vi.mock("terra-draw", () => ({
  TerraDraw: FakeDraw,
  TerraDrawRectangleMode: class {},
  TerraDrawSelectMode: class {
    options: unknown;
    constructor(options: unknown) {
      this.options = options;
    }
  },
}));
vi.mock("terra-draw-maplibre-gl-adapter", () => ({
  TerraDrawMapLibreGLAdapter: class {},
}));

import MapOverlayRectangle from "./MapOverlayRectangle";
import { overlayCorners } from "~/utils/overlayGeometry";

const overlay = {
  id: 9,
  image_url: "/o.png",
  north: 2,
  south: 1,
  east: 4,
  west: 3,
} as TMapOverlay;

const map = {
  isStyleLoaded: () => true,
  once: vi.fn(),
  off: vi.fn(),
} as unknown as Map;

// The rectangle as the component draws it: rotated corners, top-left first,
// rounded to 5 places, closed.
const ring = (
  west: number,
  south: number,
  east: number,
  north: number,
  rotation = 0,
) => {
  const corners = overlayCorners({ north, south, east, west, rotation }).map(
    ([lng, lat]) => [+lng.toFixed(5), +lat.toFixed(5)],
  );
  return [[...corners, corners[0]]];
};

const expectBounds = (actual: TMapOverlay, expected: Partial<TMapOverlay>) =>
  Object.entries(expected).forEach(([side, value]) =>
    expect(actual[side as keyof TMapOverlay]).toBeCloseTo(value as number, 4),
  );

const draw = () => draws.at(-1)!;
const storeOverlay = () => useTourStore.getState().tour!.map_overlay!;
const resizable = (flags: unknown) =>
  (flags as { rectangle: { feature: { coordinates: { resizable: string } } } })
    .rectangle.feature.coordinates.resizable;

describe("MapOverlayRectangle", () => {
  beforeEach(() => {
    draws.length = 0;
    useTourStore
      .getState()
      .setTour({ id: 1, map_overlay: overlay } as unknown as TTour);
  });

  it("adds the overlay's rectangle and keeps it selected", () => {
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    expect(draw().setMode).toHaveBeenCalledWith("select");
    expect(draw().feature!.geometry.coordinates).toEqual(ring(3, 1, 4, 2));
    expect(draw().selectFeature).toHaveBeenCalled();
  });

  it("writes the edited bounds to the store when an edit finishes", () => {
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    draw().feature!.geometry.coordinates = ring(5, 6, 7, 8);
    act(() => draw().handlers.finish("id", { action: "dragCoordinateResize" }));
    expectBounds(storeOverlay(), { west: 5, south: 6, east: 7, north: 8 });
  });

  it("keeps the rotation when a rotated rectangle is moved", () => {
    useTourStore.getState().setTour({
      id: 1,
      map_overlay: { ...overlay, rotation: 30 },
    } as unknown as TTour);
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    expect(draw().feature!.geometry.coordinates).toEqual(ring(3, 1, 4, 2, 30));

    draw().feature!.geometry.coordinates = ring(5, 6, 7, 8, 30);
    act(() => draw().handlers.finish("id", { action: "dragFeature" }));
    expectBounds(storeOverlay(), { west: 5, south: 6, east: 7, north: 8 });
    expect(storeOverlay().rotation).toBe(30);
  });

  it("redraws the rectangle when only the rotation changes", () => {
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    act(() =>
      useTourStore
        .getState()
        .updateTourField("map_overlay", { ...overlay, rotation: 45 }),
    );
    expect(draw().updateFeatureGeometry).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ coordinates: ring(3, 1, 4, 2, 45) }),
    );
  });

  it("only resizes evenly while rotated, so it can't skew", () => {
    useTourStore.getState().setTour({
      id: 1,
      map_overlay: { ...overlay, rotation: 30 },
    } as unknown as TTour);
    const { rerender } = render(
      <MapOverlayRectangle map={map} mode="opposite" draggable />,
    );
    expect(resizable(draw().options.modes[1].options?.flags)).toBe(
      "opposite-fixed",
    );

    act(() =>
      useTourStore
        .getState()
        .updateTourField("map_overlay", { ...overlay, rotation: 0 }),
    );
    rerender(<MapOverlayRectangle map={map} mode="opposite" draggable />);
    const [, options] = draw().updateModeOptions.mock.lastCall!;
    expect(resizable((options as { flags: unknown }).flags)).toBe("opposite");
  });

  it("snaps a skewed shape back to a rectangle after a resize", () => {
    useTourStore.getState().setTour({
      id: 1,
      map_overlay: { ...overlay, rotation: 30 },
    } as unknown as TTour);
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    const skewed = ring(3, 1, 4, 2, 30);
    skewed[0][1] = [skewed[0][1][0] + 0.2, skewed[0][1][1]];
    draw().feature!.geometry.coordinates = skewed;

    act(() => draw().handlers.finish("id", { action: "dragCoordinateResize" }));
    const [, geometry] = draw().updateFeatureGeometry.mock.lastCall!;
    const saved = storeOverlay();
    expect((geometry as { coordinates: unknown }).coordinates).toEqual(
      ring(saved.west, saved.south, saved.east, saved.north, 30),
    );
  });

  it("turns dragging the whole rectangle on and off", () => {
    const draggableFlag = (flags: unknown) =>
      (flags as { rectangle: { feature: { draggable: boolean } } }).rectangle
        .feature.draggable;
    const { rerender } = render(
      <MapOverlayRectangle map={map} mode="opposite-fixed" draggable={false} />,
    );
    expect(draggableFlag(draw().options.modes[1].options?.flags)).toBe(false);

    rerender(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    const [, options] = draw().updateModeOptions.mock.lastCall!;
    expect(draggableFlag((options as { flags: unknown }).flags)).toBe(true);
    expect(draws).toHaveLength(1);
  });

  it("ignores finish events that aren't a move or resize", () => {
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    draw().feature!.geometry.coordinates = ring(5, 6, 7, 8);
    act(() => draw().handlers.finish("id", { action: "draw" }));
    expect(storeOverlay().west).toBe(3);
  });

  it("doesn't rebuild Terra Draw when the bounds change", () => {
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    act(() =>
      useTourStore
        .getState()
        .updateTourField("map_overlay", { ...overlay, north: 3 }),
    );
    expect(draws).toHaveLength(1);
    expect(draw().updateFeatureGeometry).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ coordinates: ring(3, 1, 4, 3) }),
    );
  });

  it("doesn't move the rectangle back after its own edit", () => {
    render(<MapOverlayRectangle map={map} mode="opposite-fixed" draggable />);
    draw().feature!.geometry.coordinates = ring(5, 6, 7, 8);
    act(() => draw().handlers.finish("id", { action: "dragFeature" }));
    expect(draw().updateFeatureGeometry).not.toHaveBeenCalled();
  });

  it("updates the resize mode on the live instance", () => {
    const { rerender } = render(
      <MapOverlayRectangle map={map} mode="opposite-fixed" draggable />,
    );
    const selectMode = draw().options.modes[1];
    expect(resizable(selectMode.options?.flags)).toBe("opposite-fixed");

    rerender(<MapOverlayRectangle map={map} mode="opposite" draggable />);
    expect(draws).toHaveLength(1);
    const [modeName, options] = draw().updateModeOptions.mock.lastCall!;
    expect(modeName).toBe("select");
    expect(resizable((options as { flags: unknown }).flags)).toBe("opposite");
  });

  it("survives cleanup after the map has been removed", () => {
    const { unmount } = render(
      <MapOverlayRectangle map={map} mode="opposite-fixed" draggable />,
    );
    draw().stop.mockImplementation(() => {
      throw new TypeError("no source");
    });
    expect(() => unmount()).not.toThrow();
  });
});
