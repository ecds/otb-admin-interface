import { describe, it, expect } from "vitest";
import { fitOverlayAspect, hasOverlayAspect } from "./overlayAspect";
import type { TMapOverlay } from "~/types";

const toY = (lat: number) =>
  (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI;

// Width over height as drawn on the map.
const drawnAspect = (
  o: Pick<TMapOverlay, "north" | "south" | "east" | "west">,
) => (o.east - o.west) / (toY(o.north) - toY(o.south));

const overlay = (overrides: Partial<TMapOverlay> = {}) =>
  ({
    id: 1,
    image_url: "/o.png",
    north: 34,
    south: 33,
    east: -84,
    west: -85,
    width: 400,
    height: 100,
    ...overrides,
  }) as TMapOverlay;

describe("fitOverlayAspect", () => {
  it("gives a wide image a wide box, keeping width and center", () => {
    const o = overlay();
    const fitted = fitOverlayAspect(o)!;
    expect(drawnAspect({ ...o, ...fitted })).toBeCloseTo(4, 6);
    expect((toY(fitted.north) + toY(fitted.south)) / 2).toBeCloseTo(
      (toY(o.north) + toY(o.south)) / 2,
      6,
    );
  });

  it("gives a tall image a tall box", () => {
    const o = overlay({ width: 100, height: 300 });
    expect(drawnAspect({ ...o, ...fitOverlayAspect(o)! })).toBeCloseTo(
      1 / 3,
      6,
    );
  });

  it("ignores rotation, which turns the whole box", () => {
    const o = overlay({ rotation: 90 });
    expect(drawnAspect({ ...o, ...fitOverlayAspect(o)! })).toBeCloseTo(4, 6);
  });

  it("returns undefined when the image size is unknown", () => {
    expect(fitOverlayAspect(overlay({ width: null }))).toBeUndefined();
    expect(fitOverlayAspect(overlay({ height: undefined }))).toBeUndefined();
  });
});

describe("hasOverlayAspect", () => {
  it("is false for a stretched overlay and true once fitted", () => {
    const o = overlay();
    expect(hasOverlayAspect(o)).toBe(false);
    expect(hasOverlayAspect({ ...o, ...fitOverlayAspect(o)! })).toBe(true);
  });

  it("is true when there's nothing to fit to", () => {
    expect(hasOverlayAspect(overlay({ width: null }))).toBe(true);
  });
});
