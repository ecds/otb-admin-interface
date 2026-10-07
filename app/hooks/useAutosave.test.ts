import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";

vi.mock("~/utils/autosave", () => ({
  flushTour: vi.fn(() => Promise.resolve(true)),
  flushTourOnExit: vi.fn(),
  hasUnsavedChanges: vi.fn(() => false),
}));

import {
  flushTour,
  flushTourOnExit,
  hasUnsavedChanges,
} from "~/utils/autosave";
import { DEBOUNCE_MS, MAX_WAIT_MS, useAutosave } from "./useAutosave";

const edit = (title: string) =>
  act(() => useTourStore.getState().updateTourField("title", title));

describe("useAutosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useTourStore.getState().setTour({ id: 1, title: "Tour" } as TTour);
  });

  afterEach(() => vi.useRealTimers());

  it("saves once editing pauses", () => {
    renderHook(() => useAutosave());
    edit("A");
    vi.advanceTimersByTime(DEBOUNCE_MS - 1);
    edit("AB");
    vi.advanceTimersByTime(DEBOUNCE_MS - 1);
    expect(flushTour).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(flushTour).toHaveBeenCalledTimes(1);
  });

  it("saves at least every MAX_WAIT while edits keep coming", () => {
    renderHook(() => useAutosave());
    for (let t = 0; t < MAX_WAIT_MS; t += DEBOUNCE_MS / 2) {
      edit(`edit ${t}`);
      vi.advanceTimersByTime(DEBOUNCE_MS / 2);
    }
    expect(flushTour).toHaveBeenCalledTimes(1);
  });

  it("doesn't save when a different tour is loaded", () => {
    renderHook(() => useAutosave());
    act(() =>
      useTourStore.getState().setTour({ id: 2, title: "Other" } as TTour),
    );
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(flushTour).not.toHaveBeenCalled();
  });

  it("sends what's left when the editor unmounts", () => {
    const { unmount } = renderHook(() => useAutosave());
    edit("A");
    unmount();
    expect(flushTour).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(flushTour).toHaveBeenCalledTimes(1);
  });

  it("sends with keepalive on pagehide", () => {
    renderHook(() => useAutosave());
    edit("A");
    window.dispatchEvent(new Event("pagehide"));
    expect(flushTourOnExit).toHaveBeenCalled();
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(flushTour).not.toHaveBeenCalled();
  });

  it("warns before unload only when there are unsaved changes", () => {
    renderHook(() => useAutosave());
    const quiet = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(quiet);
    expect(quiet.defaultPrevented).toBe(false);

    vi.mocked(hasUnsavedChanges).mockReturnValue(true);
    const pending = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(pending);
    expect(pending.defaultPrevented).toBe(true);
  });
});
