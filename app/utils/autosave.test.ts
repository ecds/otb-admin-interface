import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";

vi.mock("~/utils/requests", () => ({ saveTour: vi.fn() }));

import { saveTour } from "~/utils/requests";
import { flushTour, flushTourOnExit, hasUnsavedChanges } from "./autosave";

const base = {
  id: 1,
  tenant: "ecds",
  title: "Tour",
  stops: [],
  flat_pages: [],
  media: [],
  modes: [],
} as unknown as TTour;

const ok = (data: unknown) =>
  ({ response: { ok: true } as Response, data }) as never;

const state = () => useTourStore.getState();

describe("flushTour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.setState({ pendingSaves: 0, lastSaved: undefined });
    state().setTour(base);
  });

  it("does nothing when there are no changes", async () => {
    expect(await flushTour()).toBe(true);
    expect(saveTour).not.toHaveBeenCalled();
  });

  it("sends only what changed and adopts the server's tour", async () => {
    state().updateTourField("title", "Renamed");
    const response = { ...state().tour!, stop_count: 0 };
    vi.mocked(saveTour).mockResolvedValue(ok(response));

    expect(await flushTour()).toBe(true);
    expect(saveTour).toHaveBeenCalledWith(
      "ecds",
      1,
      { title: "Renamed" },
      false,
    );
    expect(state().tour).toBe(response);
    expect(state().lastSaved).toBeDefined();
    expect(hasUnsavedChanges()).toBe(false);
  });

  it("keeps the changes and records the error when the save fails", async () => {
    state().updateTourField("title", "");
    vi.mocked(saveTour).mockResolvedValue({
      response: { ok: false } as Response,
      data: { errors: [{ path: "title", detail: "can't be blank" }] },
    } as never);

    expect(await flushTour()).toBe(false);
    expect(state().tour!.title).toBe("");
    expect(state().saveError).toBe("title: can't be blank");
    expect(hasUnsavedChanges()).toBe(true);
  });

  it("waits for the save in flight, then sends only the newer edits", async () => {
    let finish: (v: unknown) => void = () => {};
    vi.mocked(saveTour)
      .mockImplementationOnce(
        () => new Promise((resolve) => (finish = resolve)) as never,
      )
      .mockImplementation(async () => ok(state().tour));

    state().updateTourField("title", "First");
    const first = flushTour();
    await vi.waitFor(() => expect(saveTour).toHaveBeenCalledTimes(1));
    state().updateTourField("description", "Second");
    const second = flushTour();

    finish(ok({ ...base, title: "First" }));
    await first;
    await second;
    expect(saveTour).toHaveBeenCalledTimes(2);
    expect(vi.mocked(saveTour).mock.calls[1][2]).toEqual({
      description: "Second",
    });
    expect(state().tour!.description).toBe("Second");
  });

  it("still sends the last edits after the editor has been cleared", async () => {
    state().updateTourField("title", "Leaving");
    vi.mocked(saveTour).mockResolvedValue(ok(state().tour));
    const pending = flushTour();
    state().clearTour();
    await pending;
    expect(saveTour).toHaveBeenCalledWith(
      "ecds",
      1,
      { title: "Leaving" },
      false,
    );
  });

  it("uses keepalive when the page is going away", () => {
    state().updateTourField("title", "Closing");
    vi.mocked(saveTour).mockResolvedValue(ok(state().tour));
    flushTourOnExit();
    expect(saveTour).toHaveBeenCalledWith(
      "ecds",
      1,
      { title: "Closing" },
      true,
    );
  });
});
