import type { TMedium, TTour } from "~/types";

// Alt text shorter than this doesn't describe anything. Matches the API.
export const MIN_ALT_TEXT_WORDS = 3;

export const altTextWords = (altText: string | null | undefined) =>
  altText?.trim().split(/\s+/).filter(Boolean).length ?? 0;

export const hasAltText = (medium: Pick<TMedium, "alt_text">) =>
  altTextWords(medium.alt_text) >= MIN_ALT_TEXT_WORDS;

// An image screen reader users can't make sense of: too little alt text, and
// not marked decorative. Worked out here so edits show at once, before the
// API has recalculated missing_alt_text.
export const needsAltText = (
  medium: Pick<TMedium, "alt_text" | "decorative">,
) => !medium.decorative && !hasAltText(medium);

export type TMissingAltText = {
  medium: TMedium;
  // Where it appears: "Tour" and/or stop titles.
  usedIn: string[];
};

// Every image in the tour that still needs alt text, once each even when the
// tour and several stops share it.
export const missingAltText = (tour: TTour): TMissingAltText[] => {
  const found = new Map<number, TMissingAltText>();
  const add = (media: TMedium[] | undefined, where: string) =>
    media?.filter(needsAltText).forEach((medium) => {
      const entry = found.get(medium.id) ?? { medium, usedIn: [] };
      if (!entry.usedIn.includes(where)) entry.usedIn.push(where);
      found.set(medium.id, entry);
    });

  add(tour.media, "Tour");
  tour.stops?.forEach((stop) => add(stop.media, stop.title));
  return [...found.values()];
};
