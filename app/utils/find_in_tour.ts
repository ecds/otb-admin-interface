import type { TTour } from "~/types";

/**
 * Looks up the current (last-revalidated) value of a field on whichever
 * record `model`/`recordId` refers to within the loaded tour tree, so
 * callers can tell whether their locally-saved value has shown up yet in
 * the Elasticsearch-backed read.
 */
export const findRecordValue = (
  tour: TTour,
  model: string,
  recordId: number,
  field: string,
): unknown => {
  switch (model) {
    case "tour":
      return tour[field as keyof TTour];
    case "map_overlay":
      return tour.map_overlay[field as keyof typeof tour.map_overlay];
    case "stop": {
      const stop = tour.stops.find((s) => s.id === recordId);
      return stop?.[field as keyof typeof stop];
    }
    case "flat_page": {
      const flatPage = tour.flat_pages.find((fp) => fp.id === recordId);
      return flatPage?.[field as keyof typeof flatPage];
    }
    case "medium": {
      const allMedia = [...tour.media, ...tour.stops.flatMap((s) => s.media)];
      const medium = allMedia.find((m) => m.id === recordId);
      return medium?.[field as keyof typeof medium];
    }
    case "tour_voice_over": {
      const vo = tour.voice_overs.find((v) => v.id === recordId);
      return vo;
    }
    default:
      return undefined;
  }
};
