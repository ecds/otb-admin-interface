import { describe, it, expect } from "vitest";
import { boundsFromCorners, overlayCorners, toY } from "./overlayGeometry";

const box = { north: 34, south: 33, east: -84, west: -86 };

// Corner positions in projected units, for checking shape and angle.
const projected = (corners: number[][]) =>
  corners.map(([lng, lat]) => [lng, toY(lat)]);

describe("overlayCorners", () => {
  it("returns the upright corners, top-left first, without rotation", () => {
    const [tl, tr, br, bl] = overlayCorners(box);
    expect(tl[0]).toBeCloseTo(-86);
    expect(tl[1]).toBeCloseTo(34);
    expect(tr[0]).toBeCloseTo(-84);
    expect(br[1]).toBeCloseTo(33);
    expect(bl[0]).toBeCloseTo(-86);
  });

  it("turns the box clockwise about its center", () => {
    const [tl, tr] = projected(overlayCorners({ ...box, rotation: 90 }));
    // A quarter turn clockwise puts the top edge on the right, running down.
    expect(tl[0]).toBeCloseTo(tr[0], 6);
    expect(tl[1]).toBeGreaterThan(tr[1]);
  });

  it("keeps the box's size and center when rotated", () => {
    const corners = projected(overlayCorners({ ...box, rotation: 30 }));
    const [tl, tr, br] = corners;
    const width = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
    const height = Math.hypot(br[0] - tr[0], br[1] - tr[1]);
    expect(width).toBeCloseTo(2, 6);
    expect(height).toBeCloseTo(toY(34) - toY(33), 6);
    const cx = corners.reduce((s, [x]) => s + x, 0) / 4;
    expect(cx).toBeCloseTo(-85, 6);
  });
});

describe("boundsFromCorners", () => {
  it("round-trips the box at any rotation", () => {
    for (const rotation of [0, 15, 90, -135]) {
      const ring = overlayCorners({ ...box, rotation });
      const bounds = boundsFromCorners([...ring, ring[0]], rotation)!;
      for (const side of ["north", "south", "east", "west"] as const)
        expect(bounds[side]).toBeCloseTo(box[side], 6);
    }
  });

  it("squares up a skewed shape to the box around it", () => {
    const ring = overlayCorners(box);
    ring[1] = [ring[1][0] + 0.5, ring[1][1]];
    const bounds = boundsFromCorners(ring)!;
    expect(bounds.east).toBeCloseTo(-83.5, 6);
    expect(bounds.north).toBeCloseTo(34, 6);
  });
});
