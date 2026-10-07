import { buildTourPatch } from "~/store/tourPatch";
import { useTourStore } from "~/store/tourStore";
import { saveTour } from "~/utils/requests";
import type { TTour } from "~/types";

type TSaveError = { path: string; detail: string };

type Snapshot = { tour: TTour; saved: TTour };

// Saves run one at a time; each builds its patch only once the previous one
// has landed, so nothing is sent twice.
let queue: Promise<boolean> = Promise.resolve(true);

// The editor may have unmounted (and cleared the store) by the time a queued
// save runs. Its snapshot is used then, with the baseline from any save that
// finished in the meantime.
let detachedSaved: TTour | undefined;

const errorMessage = (data: { errors?: TSaveError[] } | undefined) => {
  const errors = data?.errors ?? [];
  return errors.length > 0
    ? errors.map((e) => `${e.path}: ${e.detail}`).join(" ")
    : "Could not save the tour. Please try again.";
};

const send = async (snapshot: Snapshot, keepalive: boolean) => {
  const store = useTourStore.getState();
  const live = store.tour?.id === snapshot.tour.id;
  const tour = live ? store.tour! : snapshot.tour;
  const saved = live
    ? store.saved!
    : detachedSaved?.id === tour.id
      ? detachedSaved
      : snapshot.saved;

  const patch = buildTourPatch(saved, tour);
  if (!patch) return true;

  store.beginSave();
  const { response, data } = await saveTour(
    tour.tenant,
    tour.id,
    patch,
    keepalive,
  );
  const state = useTourStore.getState();
  state.endSave(response.ok);

  const stillLive = state.tour?.id === tour.id;
  if (response.ok) {
    if (stillLive) state.markSaved(tour, data as TTour);
    else detachedSaved = data as TTour;
  } else if (stillLive) {
    state.setSaveError(errorMessage(data));
  }
  return response.ok;
};

const snapshot = (): Snapshot | undefined => {
  const { tour, saved } = useTourStore.getState();
  return tour && saved ? { tour, saved } : undefined;
};

// Sends whatever the loaded tour has that the server doesn't. Resolves to
// false if the save failed.
export const flushTour = () => {
  const current = snapshot();
  if (!current) return queue;
  queue = queue.then(() => send(current, false));
  return queue;
};

// For pagehide: the page is going away, so don't wait behind a save that's
// already out; keepalive lets this one finish after the page is gone.
export const flushTourOnExit = () => {
  const current = snapshot();
  if (current) void send(current, true);
};

export const hasUnsavedChanges = () => {
  const { tour, saved, pendingSaves, saveError } = useTourStore.getState();
  if (!tour || !saved) return false;
  return (
    pendingSaves > 0 || !!saveError || buildTourPatch(saved, tour) !== null
  );
};

// Resolves once every queued save has finished.
export const savesSettled = () => queue;
