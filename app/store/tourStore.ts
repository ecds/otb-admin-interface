import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { TFlatPage, TTour, TStop } from "~/types";

type DirtyFields = Partial<Record<keyof TTour, boolean>>;
type DirtyStopFields = Record<number, Partial<Record<keyof TStop, boolean>>>;

type TourStore = {
  tour: TTour | null;
  pendingSaves: number;
  lastSaved: string | undefined;
  beginSave: () => void;
  endSave: (ok: boolean) => void;
  dirtyTourFields: DirtyFields;
  dirtyStopFields: DirtyStopFields;

  // Initialize from the server fetch
  setTour: (tour: TTour) => void;
  clearTour: () => void;

  // Tour-level field updates
  updateTourField: <K extends keyof TTour>(key: K, value: TTour[K]) => void;

  // Stop-level field updates (identified by stop id)
  updateStopField: <K extends keyof TStop>(
    stopId: number,
    key: K,
    value: TStop[K],
  ) => void;

  // Called after a successful sync to clear dirty tracking
  clearDirtyTourFields: (keys: (keyof TTour)[]) => void;
  clearDirtyStopFields: (stopId: number, keys: (keyof TStop)[]) => void;

  // Reorder stops (drag-and-drop)
  reorderStops: (fromIndex: number, toIndex: number) => void;

  // Add / remove a stop from the local list after API create/delete
  addStop: (stop: TStop) => void;
  removeStop: (stopId: number) => void;

  // Mirror a field the server just accepted into wherever that record lives
  // in the tour. No-op for records that aren't part of the loaded tour.
  applySavedField: (
    model: string,
    recordId: number,
    field: string,
    value: unknown,
  ) => void;

  // Map icons: a stop without its own icon shows the tour's.
  setTourMapIcon: (url: string | undefined) => void;
  setStopMapIcon: (stopId: number, url: string | undefined) => void;

  reorderFlatPages: (fromIndex: number, toIndex: number) => void;
  addFlatPage: (flatPage: TFlatPage) => void;
  removeFlatPage: (flatPageId: number) => void;
};

export const useTourStore = create<TourStore>()(
  immer((set) => ({
    tour: null,
    pendingSaves: 0,
    lastSaved: undefined,
    beginSave: () =>
      set((state) => {
        state.pendingSaves += 1;
      }),
    endSave: (ok) =>
      set((state) => {
        state.pendingSaves = Math.max(0, state.pendingSaves - 1);
        if (ok) state.lastSaved = new Date().toLocaleString();
      }),
    dirtyTourFields: {},
    dirtyStopFields: {},

    setTour: (tour) =>
      set((state) => {
        state.tour = tour;
        state.dirtyTourFields = {};
        state.dirtyStopFields = {};
      }),

    clearTour: () =>
      set((state) => {
        state.tour = null;
        state.dirtyTourFields = {};
        state.dirtyStopFields = {};
      }),

    updateTourField: (key, value) =>
      set((state) => {
        if (!state.tour) return;
        (state.tour[key] as TTour[typeof key]) = value;
        state.dirtyTourFields[key] = true;
      }),

    updateStopField: (stopId, key, value) =>
      set((state) => {
        if (!state.tour) return;
        const stop = state.tour.stops.find((s) => s.id === stopId);
        if (!stop) return;
        (stop[key] as TStop[typeof key]) = value;
        state.dirtyStopFields[stopId] ??= {};
        state.dirtyStopFields[stopId][key] = true;
      }),

    clearDirtyTourFields: (keys) =>
      set((state) => {
        for (const key of keys) delete state.dirtyTourFields[key];
      }),

    clearDirtyStopFields: (stopId, keys) =>
      set((state) => {
        if (!state.dirtyStopFields[stopId]) return;
        for (const key of keys) delete state.dirtyStopFields[stopId][key];
        if (Object.keys(state.dirtyStopFields[stopId]).length === 0)
          delete state.dirtyStopFields[stopId];
      }),

    reorderStops: (fromIndex, toIndex) =>
      set((state) => {
        if (!state.tour) return;
        const stops = state.tour.stops;
        const [moved] = stops.splice(fromIndex, 1);
        stops.splice(toIndex, 0, moved);
        stops.forEach((stop, i) => {
          stop.position = i + 1;
        });
      }),

    addStop: (stop) =>
      set((state) => {
        state.tour?.stops.push(stop);
      }),

    removeStop: (stopId) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.stops = state.tour.stops.filter((s) => s.id !== stopId);
        delete state.dirtyStopFields[stopId];
      }),

    applySavedField: (model, recordId, field, value) =>
      set((state) => {
        const tour = state.tour;
        if (!tour) return;
        const assign = (target: object | undefined) => {
          if (target) (target as Record<string, unknown>)[field] = value;
        };
        switch (model) {
          case "tour":
            if (tour.id === recordId) assign(tour);
            break;
          case "stop":
            assign(tour.stops.find((s) => s.id === recordId));
            break;
          case "flat_page":
            assign(tour.flat_pages.find((p) => p.id === recordId));
            break;
          case "map_overlay":
            if (tour.map_overlay?.id === recordId) assign(tour.map_overlay);
            break;
          case "medium":
            [tour.media, ...tour.stops.map((s) => s.media)].forEach((media) =>
              media?.filter((m) => m.id === recordId).forEach(assign),
            );
            break;
        }
      }),

    setTourMapIcon: (url) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.map_icon = url;
        state.tour.stops.forEach((stop) => {
          if (!stop.map_icon_custom) stop.map_icon = url;
        });
      }),

    setStopMapIcon: (stopId, url) =>
      set((state) => {
        const stop = state.tour?.stops.find((s) => s.id === stopId);
        if (!stop || !state.tour) return;
        stop.map_icon_custom = url !== undefined;
        stop.map_icon = url ?? state.tour.map_icon;
      }),

    reorderFlatPages: (fromIndex, toIndex) =>
      set((state) => {
        if (!state.tour) return;
        const pages = state.tour.flat_pages;
        const [moved] = pages.splice(fromIndex, 1);
        pages.splice(toIndex, 0, moved);
        pages.forEach((page, i) => {
          page.position = i + 1;
        });
      }),

    addFlatPage: (flatPage) =>
      set((state) => {
        state.tour?.flat_pages.push(flatPage);
      }),

    removeFlatPage: (flatPageId) =>
      set((state) => {
        if (!state.tour) return;
        state.tour.flat_pages = state.tour.flat_pages.filter(
          (p) => p.id !== flatPageId,
        );
      }),
  })),
);

// Shared inputs also render outside the tour editor (e.g. tour-set settings),
// where records live in the "public" tenant.
export const useTenant = () => useTourStore((s) => s.tour?.tenant ?? "public");
