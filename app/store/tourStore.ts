import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TFlatPage, TTour, TStop } from "~/types";

type TourStore = {
  tour: TTour | null;
  // The tour as the server last confirmed it. Autosave sends the difference
  // between this and `tour`.
  saved: TTour | null;
  pendingSaves: number;
  lastSaved: string | undefined;
  saveError: string | undefined;
  beginSave: () => void;
  endSave: (ok: boolean) => void;
  setSaveError: (message: string | undefined) => void;

  // Initialize from the server fetch. `saved` differs from `tour` only when
  // reopening a tour that still had edits waiting to go out.
  setTour: (tour: TTour, saved?: TTour) => void;
  clearTour: () => void;

  // A save succeeded. `sent` is the tour the request was built from; edits
  // made since then stay in `tour` and go out with the next save.
  markSaved: (sent: TTour, response: TTour) => void;

  // Local edits, picked up by autosave.
  updateTourField: <K extends keyof TTour>(key: K, value: TTour[K]) => void;
  updateStopField: <K extends keyof TStop>(
    stopId: number,
    key: K,
    value: TStop[K],
  ) => void;
  // Edit a field on whichever record of the loaded tour matches. Returns
  // false when the record isn't part of the tour, so callers can save it
  // some other way.
  editRecord: (
    model: string,
    recordId: number,
    field: string,
    value: unknown,
  ) => boolean;

  // Mirror a change the server already has (uploads, replaced files) into
  // both the edited and the saved tour, so autosave doesn't resend it.
  applySavedField: (
    model: string,
    recordId: number,
    field: string,
    value: unknown,
  ) => void;
  applyServerChange: (recipe: (tour: TTour) => void) => void;

  reorderStops: (fromIndex: number, toIndex: number) => void;
  addStop: (stop: TStop) => void;
  removeStop: (stopId: number) => void;

  // Map icons: a stop without its own icon shows the tour's.
  setTourMapIcon: (url: string | undefined) => void;
  setStopMapIcon: (stopId: number, url: string | undefined) => void;

  reorderFlatPages: (fromIndex: number, toIndex: number) => void;
  addFlatPage: (flatPage: TFlatPage) => void;
  removeFlatPage: (flatPageId: number) => void;
};

// Returns every object in the tour that `model`/`recordId` refers to. A
// medium can be shared by the tour and several stops, so there may be many.
const findRecords = (tour: TTour, model: string, recordId: number) => {
  switch (model) {
    case "tour":
      return tour.id === recordId ? [tour] : [];
    case "stop":
      return tour.stops.filter((s) => s.id === recordId);
    case "tour_stop":
      return tour.stops.filter((s) => s.relation_id === recordId);
    case "flat_page":
      return tour.flat_pages.filter((p) => p.id === recordId);
    case "map_overlay":
      return tour.map_overlay?.id === recordId ? [tour.map_overlay] : [];
    case "medium":
      return [tour.media, ...tour.stops.map((s) => s.media)].flatMap(
        (media) => media?.filter((m) => m.id === recordId) ?? [],
      );
    default:
      return [];
  }
};

const assignField = (
  tour: TTour | null,
  model: string,
  recordId: number,
  field: string,
  value: unknown,
) => {
  if (!tour) return false;
  const records = findRecords(tour, model, recordId);
  records.forEach((record) => {
    (record as Record<string, unknown>)[field] = value;
  });
  return records.length > 0;
};

type Joined = { id: number; relation_id: number };

const copyRelationIds = (target: Joined[] = [], source: Joined[] = []) => {
  const ids = new Map(source.map((item) => [item.id, item.relation_id]));
  target.forEach((item) => {
    item.relation_id ??= ids.get(item.id)!;
  });
};

// Records linked by a save need their new join ids, even when the rest of
// the edited tour is kept.
const backfillRelationIds = (tour: TTour, response: TTour) => {
  copyRelationIds(tour.stops, response.stops);
  copyRelationIds(tour.flat_pages, response.flat_pages);
  copyRelationIds(tour.media, response.media);
  copyRelationIds(tour.modes, response.modes);
  tour.stops.forEach((stop) =>
    copyRelationIds(
      stop.media,
      response.stops.find((s) => s.id === stop.id)?.media,
    ),
  );
};

const renumber = (items: { position: number }[]) =>
  items.forEach((item, i) => {
    item.position = i + 1;
  });

export const useTourStore = create<TourStore>()(
  immer((set, get) => ({
    tour: null,
    saved: null,
    pendingSaves: 0,
    lastSaved: undefined,
    saveError: undefined,
    beginSave: () =>
      set((state) => {
        state.pendingSaves += 1;
      }),
    endSave: (ok) =>
      set((state) => {
        state.pendingSaves = Math.max(0, state.pendingSaves - 1);
        if (ok) state.lastSaved = new Date().toLocaleString();
      }),
    setSaveError: (message) =>
      set((state) => {
        state.saveError = message;
      }),

    setTour: (tour, saved = tour) =>
      set((state) => {
        state.tour = tour;
        state.saved = saved;
        state.saveError = undefined;
      }),

    clearTour: () =>
      set((state) => {
        state.tour = null;
        state.saved = null;
        state.saveError = undefined;
      }),

    markSaved: (sent, response) =>
      set((state) => {
        state.saved = response;
        state.saveError = undefined;
        // Nothing changed while the request was out: take the server's copy,
        // which carries derived fields and ids for newly linked records.
        if (get().tour === sent) state.tour = response;
        else if (state.tour) backfillRelationIds(state.tour, response);
      }),

    updateTourField: (key, value) =>
      set((state) => {
        if (!state.tour) return;
        (state.tour[key] as TTour[typeof key]) = value;
      }),

    updateStopField: (stopId, key, value) =>
      set((state) => {
        const stop = state.tour?.stops.find((s) => s.id === stopId);
        if (stop) (stop[key] as TStop[typeof key]) = value;
      }),

    editRecord: (model, recordId, field, value) => {
      if (!get().tour || findRecords(get().tour!, model, recordId).length === 0)
        return false;
      set((state) => {
        assignField(state.tour, model, recordId, field, value);
      });
      return true;
    },

    applySavedField: (model, recordId, field, value) =>
      set((state) => {
        assignField(state.tour, model, recordId, field, value);
        assignField(state.saved, model, recordId, field, value);
      }),

    applyServerChange: (recipe) =>
      set((state) => {
        if (state.tour) recipe(state.tour);
        if (state.saved) recipe(state.saved);
      }),

    reorderStops: (fromIndex, toIndex) =>
      set((state) => {
        if (!state.tour) return;
        const stops = state.tour.stops;
        const [moved] = stops.splice(fromIndex, 1);
        stops.splice(toIndex, 0, moved);
        renumber(stops);
      }),

    addStop: (stop) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.stops.push({
          ...stop,
          position: state.tour.stops.length + 1,
        });
      }),

    removeStop: (stopId) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.stops = state.tour.stops.filter((s) => s.id !== stopId);
        renumber(state.tour.stops);
      }),

    setTourMapIcon: (url) =>
      set((state) => {
        for (const tour of [state.tour, state.saved]) {
          if (!tour) continue;
          tour.map_icon = url;
          tour.stops.forEach((stop) => {
            if (!stop.map_icon_custom) stop.map_icon = url;
          });
        }
      }),

    setStopMapIcon: (stopId, url) =>
      set((state) => {
        for (const tour of [state.tour, state.saved]) {
          const stop = tour?.stops.find((s) => s.id === stopId);
          if (!stop || !tour) continue;
          stop.map_icon_custom = url !== undefined;
          stop.map_icon = url ?? tour.map_icon;
        }
      }),

    reorderFlatPages: (fromIndex, toIndex) =>
      set((state) => {
        if (!state.tour) return;
        const pages = state.tour.flat_pages;
        const [moved] = pages.splice(fromIndex, 1);
        pages.splice(toIndex, 0, moved);
        renumber(pages);
      }),

    addFlatPage: (flatPage) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.flat_pages.push({
          ...flatPage,
          position: state.tour.flat_pages.length + 1,
        });
      }),

    removeFlatPage: (flatPageId) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.flat_pages = state.tour.flat_pages.filter(
          (p) => p.id !== flatPageId,
        );
        renumber(state.tour.flat_pages);
      }),
  })),
);

// Shared inputs also render outside the tour editor (e.g. tour-set settings),
// where records live in the "public" tenant.
export const useTenant = () => useTourStore((s) => s.tour?.tenant ?? "public");
