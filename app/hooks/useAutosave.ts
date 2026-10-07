import { useEffect } from "react";
import { useTourStore } from "~/store/tourStore";
import {
  flushTour,
  flushTourOnExit,
  hasUnsavedChanges,
} from "~/utils/autosave";

// Wait for a pause in editing, but never hold changes longer than MAX_WAIT
// while someone keeps typing.
export const DEBOUNCE_MS = 1000;
export const MAX_WAIT_MS = 8000;

export function useAutosave() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let firstChangeAt: number | undefined;

    const run = () => {
      timer = undefined;
      firstChangeAt = undefined;
      void flushTour();
    };

    const schedule = () => {
      const now = Date.now();
      firstChangeAt ??= now;
      clearTimeout(timer);
      const wait = Math.min(DEBOUNCE_MS, firstChangeAt + MAX_WAIT_MS - now);
      timer = setTimeout(run, Math.max(0, wait));
    };

    const unsubscribe = useTourStore.subscribe((state, prev) => {
      if (
        state.tour &&
        state.tour !== prev.tour &&
        state.tour !== state.saved &&
        state.tour.id === prev.tour?.id
      )
        schedule();
    });

    const onPageHide = () => {
      clearTimeout(timer);
      timer = undefined;
      flushTourOnExit();
    };

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      // Older browsers only show the prompt when returnValue is set.
      event.returnValue = "";
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearTimeout(timer);
      // Leaving the editor inside the app: send what's left.
      void flushTour();
    };
  }, []);
}
