import type { TMapOverlay } from "~/types";
import { toLat, toY } from "./overlayGeometry";

// North and south bounds that give the overlay its image's aspect ratio, as
// drawn on the map. Keeps the current center and width so the image only
// grows or shrinks vertically. Undefined when the image size isn't known.
export const fitOverlayAspect = (
  overlay: TMapOverlay,
): Pick<TMapOverlay, "north" | "south"> | undefined => {
  // Rotation turns the whole box, so the box itself keeps the image's shape.
  const { width, height } = overlay;
  const span = overlay.east - overlay.west;
  if (!width || !height || !(span > 0)) return;

  const centerY = (toY(overlay.north) + toY(overlay.south)) / 2;
  const halfHeight = (span * height) / width / 2;
  return {
    north: toLat(centerY + halfHeight),
    south: toLat(centerY - halfHeight),
  };
};

// Already within rounding of the image's shape.
export const hasOverlayAspect = (overlay: TMapOverlay) => {
  const fitted = fitOverlayAspect(overlay);
  return (
    !fitted ||
    (Math.abs(fitted.north - overlay.north) < 1e-6 &&
      Math.abs(fitted.south - overlay.south) < 1e-6)
  );
};
