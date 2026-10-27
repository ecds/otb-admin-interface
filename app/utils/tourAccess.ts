import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";

// Why the signed-in user can't remove this stop or medium from the tour, or
// undefined when they can. Student authors can remove only what they added,
// and only before the tour is published; the API enforces the same rule.
export const removalBlocked = (
  tour: TTour | null | undefined,
  kind: "stop" | "medium",
  id: number,
) => {
  const access = tour?.access;
  if (!tour || !access?.student) return undefined;
  if (tour.published)
    return "Student authors can't remove anything once the tour is published.";

  const removable =
    kind === "stop" ? access.removable_stop_ids : access.removable_medium_ids;
  if (removable?.includes(id)) return undefined;
  return `Student authors can only remove ${kind === "stop" ? "stops" : "images"} they added.`;
};

// From the last saved copy, which is what the API's answer describes.
export const useRemovalBlocked = (kind: "stop" | "medium", id: number) =>
  useTourStore((s) => removalBlocked(s.saved, kind, id));

export const useMayPublish = () =>
  useTourStore((s) => s.saved?.access?.publish ?? true);
