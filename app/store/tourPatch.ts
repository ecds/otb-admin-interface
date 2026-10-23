import type { TFlatPage, TMedium, TStop, TTour } from "~/types";

// Fields the tour PATCH endpoint accepts. Anything else in the tour document
// is server-derived and never sent.
const TOUR_FIELDS = [
  "blank_map",
  "default_lng",
  "description",
  "icon_color",
  "is_geo",
  "link_address",
  "link_text",
  "map_type",
  "meta_description",
  "open_geographies_endpoint",
  "published",
  "restrict_bounds_to_overlay",
  "restrict_bounds",
  "title",
  "use_directions",
] as const;

const STOP_FIELDS = [
  "address",
  "article_link",
  "description",
  "direction_intro",
  "direction_notes",
  "icon_color",
  "lat",
  "lng",
  "meta_description",
  "parking_address",
  "parking_lat",
  "parking_lng",
  "title",
] as const;

const MEDIUM_FIELDS = ["title", "caption", "alt_text", "decorative"] as const;
const FLAT_PAGE_FIELDS = ["title", "body"] as const;
const OVERLAY_FIELDS = ["north", "south", "east", "west", "rotation"] as const;

type Entry = Record<string, unknown>;
export type TourPatch = Record<string, unknown>;

type Positioned = { id: number; relation_id?: number; position?: number };

const changedFields = <T extends object>(
  before: T,
  after: T,
  fields: readonly string[],
) => {
  const changes: Entry = {};
  for (const field of fields) {
    const value = (after as Record<string, unknown>)[field];
    if (value !== (before as Record<string, unknown>)[field])
      changes[field] = value ?? null;
  }
  return changes;
};

// Diffs one joined list. Entries the editor still has are matched to the
// saved list by record id; new ones are linked by id, removed ones unlinked
// with _destroy. When the order changed every entry carries its position.
// `linkExtras` adds anything a newly linked record brings with it.
const diffList = <T extends Positioned>(
  saved: T[],
  current: T[],
  fieldsOf: (before: T, after: T) => Entry,
  linkExtras: (item: T) => Entry = () => ({}),
) => {
  const savedById = new Map(saved.map((item) => [item.id, item]));
  const currentIds = new Set(current.map((item) => item.id));
  // Positions are renumbered 1..n whenever anything moves, so a removal from
  // the middle (or gaps already on the server) also counts.
  const reordered = current.some(
    (item, index) => savedById.get(item.id)?.position !== index + 1,
  );

  const entries: Entry[] = [];
  current.forEach((item, index) => {
    const before = savedById.get(item.id);
    const position = reordered ? { position: index + 1 } : {};
    if (!before) {
      entries.push({ id: item.id, ...position, ...linkExtras(item) });
      return;
    }
    const fields = fieldsOf(before, item);
    if (reordered || Object.keys(fields).length > 0)
      entries.push({ relation_id: before.relation_id, ...position, ...fields });
  });
  saved
    .filter((item) => !currentIds.has(item.id))
    .forEach((item) =>
      entries.push({ relation_id: item.relation_id, _destroy: true }),
    );

  return entries;
};

const diffMedia = (saved: TMedium[] = [], current: TMedium[] = []) =>
  diffList(saved, current, (before, after) =>
    changedFields(before, after, MEDIUM_FIELDS),
  );

const diffStops = (saved: TStop[], current: TStop[]) =>
  diffList(
    saved,
    current,
    (before, after) => {
      const fields = changedFields(before, after, STOP_FIELDS);
      const media = diffMedia(before.media, after.media);
      return media.length > 0 ? { ...fields, media } : fields;
    },
    // A copied stop arrives with the media it should be linked to.
    (stop) =>
      stop.media?.length
        ? { media: stop.media.map((m, i) => ({ id: m.id, position: i + 1 })) }
        : {},
  );

const diffFlatPages = (saved: TFlatPage[], current: TFlatPage[]) =>
  diffList(saved, current, (before, after) =>
    changedFields(before, after, FLAT_PAGE_FIELDS),
  );

const diffModes = (saved: TTour["modes"], current: TTour["modes"]) => {
  const savedIds = new Set(saved.map((mode) => mode.id));
  const currentIds = new Set(current.map((mode) => mode.id));
  return [
    ...current.filter((m) => !savedIds.has(m.id)).map((m) => ({ id: m.id })),
    ...saved
      .filter((m) => !currentIds.has(m.id))
      .map((m) => ({ id: m.id, _destroy: true })),
  ];
};

// The partial document that turns `saved` into `current`, or null when
// there is nothing to send.
export const buildTourPatch = (saved: TTour, current: TTour) => {
  const patch: TourPatch = changedFields(saved, current, TOUR_FIELDS);

  if (current.theme?.id !== saved.theme?.id && current.theme?.id)
    patch.theme = { id: current.theme.id };
  if (current.mode?.id !== saved.mode?.id && current.mode?.id)
    patch.mode = { id: current.mode.id };

  const lists = {
    stops: diffStops(saved.stops ?? [], current.stops ?? []),
    flat_pages: diffFlatPages(saved.flat_pages ?? [], current.flat_pages ?? []),
    media: diffMedia(saved.media, current.media),
    modes: diffModes(saved.modes ?? [], current.modes ?? []),
  };
  for (const [key, entries] of Object.entries(lists))
    if (entries.length > 0) patch[key] = entries;

  const overlay = current.map_overlay;
  if (overlay && overlay.id === saved.map_overlay?.id) {
    const fields = changedFields(saved.map_overlay, overlay, OVERLAY_FIELDS);
    if (Object.keys(fields).length > 0)
      patch.map_overlay = { id: overlay.id, ...fields };
  }

  return Object.keys(patch).length > 0 ? patch : null;
};
