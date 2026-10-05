import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour, TTravelMode } from "~/types";
import TravelModes from "./TravelModes";

vi.mock("~/utils/requests", () => ({
  sendCreate: vi.fn(),
  sendDelete: vi.fn(),
  sendUpdate: vi.fn(),
}));

import { sendCreate, sendDelete, sendUpdate } from "~/utils/requests";

const modes = [
  { id: 1, title: "WALKING" },
  { id: 2, title: "DRIVING" },
] as TTravelMode[];

const setFeedback = vi.fn();

const loadTour = (overrides: Partial<TTour> = {}) =>
  useTourStore.getState().setTour({
    id: 5,
    tenant: "ecds",
    modes: [{ ...modes[0], relation_id: 100 }],
    mode: modes[0],
    ...overrides,
  } as unknown as TTour);

const renderModes = () =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <TravelModes modes={modes} />
    </FeedbackContext.Provider>,
  );

const ok = (data: unknown = {}) =>
  ({ response: { ok: true } as Response, data }) as any;
const fail = () => ({ response: { ok: false } as Response, data: {} }) as any;

const checkbox = (id: number) => document.getElementById(`mode-${id}`)!;
const radio = (title: string) =>
  document.getElementById(`radio-${title}`) as HTMLInputElement;

describe("TravelModes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadTour();
  });

  it("checks only the tour's enabled modes", () => {
    renderModes();
    expect(checkbox(1)).toHaveAttribute("aria-checked", "true");
    expect(checkbox(2)).toHaveAttribute("aria-checked", "false");
  });

  it("adds the created relation to the store when a mode is enabled", async () => {
    vi.mocked(sendCreate).mockResolvedValue(
      ok({ ...modes[1], relation_id: 200 }),
    );
    renderModes();
    fireEvent.click(checkbox(2));
    await waitFor(() =>
      expect(useTourStore.getState().tour!.modes.map((m) => m.id)).toEqual([
        1, 2,
      ]),
    );
    expect(checkbox(2)).toHaveAttribute("aria-checked", "true");
  });

  it("can disable a mode that was enabled in the same session", async () => {
    vi.mocked(sendCreate).mockResolvedValue(
      ok({ ...modes[1], relation_id: 200 }),
    );
    vi.mocked(sendDelete).mockResolvedValue(ok());
    renderModes();
    fireEvent.click(checkbox(2));
    await waitFor(() =>
      expect(checkbox(2)).toHaveAttribute("aria-checked", "true"),
    );
    fireEvent.click(checkbox(2));
    await waitFor(() =>
      expect(sendDelete).toHaveBeenCalledWith(
        expect.objectContaining({ record: 200 }),
      ),
    );
    await waitFor(() =>
      expect(checkbox(2)).toHaveAttribute("aria-checked", "false"),
    );
  });

  it("keeps the mode enabled and reports an error when disabling fails", async () => {
    vi.mocked(sendDelete).mockResolvedValue(fail());
    renderModes();
    fireEvent.click(checkbox(1));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(useTourStore.getState().tour!.modes).toHaveLength(1);
  });

  it("updates the default mode in the store", async () => {
    loadTour({
      modes: [
        { ...modes[0], relation_id: 100 },
        { ...modes[1], relation_id: 200 },
      ],
    } as Partial<TTour>);
    vi.mocked(sendUpdate).mockResolvedValue(ok());
    renderModes();
    fireEvent.click(radio("DRIVING"));
    await waitFor(() => expect(useTourStore.getState().tour!.mode.id).toBe(2));
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ tour: { mode_id: 2 } }),
      }),
    );
  });

  it("rolls back the default mode when the save fails", async () => {
    loadTour({
      modes: [
        { ...modes[0], relation_id: 100 },
        { ...modes[1], relation_id: 200 },
      ],
    } as Partial<TTour>);
    vi.mocked(sendUpdate).mockResolvedValue(fail());
    renderModes();
    fireEvent.click(radio("DRIVING"));
    await waitFor(() => expect(setFeedback).toHaveBeenCalled());
    expect(useTourStore.getState().tour!.mode.id).toBe(1);
  });
});
