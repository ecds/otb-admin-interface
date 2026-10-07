import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import SaveButton from "./SaveButton";

vi.mock("~/utils/autosave", () => ({ flushTour: vi.fn() }));

import { flushTour } from "~/utils/autosave";

const setFeedback = vi.fn();

const renderButton = () =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <SaveButton />
    </FeedbackContext.Provider>,
  );

describe("SaveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.setState({
      pendingSaves: 0,
      lastSaved: undefined,
      saveError: undefined,
    });
    useTourStore.getState().setTour({ id: 1, title: "Tour" } as TTour);
  });

  const edit = () =>
    act(() => useTourStore.getState().updateTourField("title", "Edited"));

  it("is disabled when there is nothing to save", () => {
    renderButton();
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
  });

  it("enables after an edit", () => {
    renderButton();
    edit();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("stays enabled after a failed save so it can be retried", () => {
    renderButton();
    act(() => useTourStore.getState().setSaveError("nope"));
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("sends waiting changes right away and clears old feedback", async () => {
    vi.mocked(flushTour).mockResolvedValue(true);
    renderButton();
    edit();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(flushTour).toHaveBeenCalled();
    await waitFor(() => expect(setFeedback).toHaveBeenCalledWith(undefined));
  });

  it("is disabled and shows progress while a save is out", () => {
    useTourStore.setState({ pendingSaves: 1 });
    renderButton();
    edit();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it("shows the last saved time", () => {
    useTourStore.setState({ lastSaved: "10/6/2026, 9:00:00 AM" });
    renderButton();
    expect(screen.getByText("10/6/2026, 9:00:00 AM")).toBeInTheDocument();
  });

  it("reports a failed save, including autosaves", () => {
    renderButton();
    act(() => useTourStore.getState().setSaveError("title: can't be blank"));
    expect(setFeedback).toHaveBeenCalledWith({
      type: "error",
      message: "title: can't be blank",
    });
  });
});
