import type { TMapOverlay } from "~/types";

export type Bounds = Pick<TMapOverlay, "north" | "south" | "east" | "west">;
type LngLat = [number, number];

// Web Mercator y in degree-like units, so it can be compared with longitude.
// Shapes are worked out in this projection because it's how the map draws
// them; plain latitude would skew them away from the equator.
export const toY = (lat: number) =>
  (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI;

export const toLat = (y: number) =>
  ((2 * Math.atan(Math.exp((y * Math.PI) / 180)) - Math.PI / 2) * 180) /
  Math.PI;

const radians = (degrees: number) => (degrees * Math.PI) / 180;

// The overlay is stored as an upright box plus a clockwise rotation about
// its center. Returns the image's corners on the map: top-left, top-right,
// bottom-right, bottom-left (the order MapLibre's image source expects).
export const overlayCorners = (
  overlay: Bounds & { rotation?: number | null },
): LngLat[] => {
  const cx = (overlay.east + overlay.west) / 2;
  const top = toY(overlay.north);
  const bottom = toY(overlay.south);
  const cy = (top + bottom) / 2;
  const halfW = (overlay.east - overlay.west) / 2;
  const halfH = (top - bottom) / 2;
  const angle = radians(overlay.rotation ?? 0);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return (
    [
      [-halfW, halfH],
      [halfW, halfH],
      [halfW, -halfH],
      [-halfW, -halfH],
    ] as const
  ).map(([dx, dy]): LngLat => [
    cx + dx * cos + dy * sin,
    toLat(cy - dx * sin + dy * cos),
  ]);
};

// The upright box for a drawn (possibly rotated, possibly skewed) shape at
// the given rotation: un-rotate its points about their center and take the
// extent. Edits that skew the shape come back as a proper rectangle.
export const boundsFromCorners = (
  points: number[][],
  rotation = 0,
): Bounds | undefined => {
  // A closed ring repeats its first point.
  const corners =
    points.length > 1 &&
    points[0][0] === points.at(-1)![0] &&
    points[0][1] === points.at(-1)![1]
      ? points.slice(0, -1)
      : points;
  if (corners.length < 3) return;

  const projected = corners.map(([lng, lat]) => [lng, toY(lat)]);
  const cx = projected.reduce((sum, [x]) => sum + x, 0) / projected.length;
  const cy = projected.reduce((sum, [, y]) => sum + y, 0) / projected.length;
  const angle = radians(rotation);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Inverse of the clockwise rotation used in overlayCorners.
  const local = projected.map(([x, y]) => {
    const dx = x - cx;
    const dy = y - cy;
    return [dx * cos - dy * sin, dx * sin + dy * cos];
  });
  const xs = local.map(([x]) => x);
  const ys = local.map(([, y]) => y);

  return {
    west: cx + Math.min(...xs),
    east: cx + Math.max(...xs),
    south: toLat(cy + Math.min(...ys)),
    north: toLat(cy + Math.max(...ys)),
  };
};
