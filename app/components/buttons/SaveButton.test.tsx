import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import SaveButton from "./SaveButton";

vi.mock("~/utils/requests", () => ({ saveTour: vi.fn() }));
vi.mock("react-router", () => ({
  useParams: () => ({ tourSet: "ecds", tour_id: "1" }),
}));

import { saveTour } from "~/utils/requests";

const tour = { id: 1, tenant: "ecds", title: "Draft" } as unknown as TTour;
const setFeedback = vi.fn();
let client: QueryClient;

const renderButton = () =>
  render(
    <QueryClientProvider client={client}>
      <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
        <SaveButton />
      </FeedbackContext.Provider>
    </QueryClientProvider>,
  );

describe("SaveButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient();
    client.setQueryData(["tour", "ecds", "1"], { tour, modes: [] });
    useTourStore.setState({ pendingSaves: 0, lastSaved: undefined });
    useTourStore.getState().setTour(tour);
  });

  it("sends the store's tour", async () => {
    vi.mocked(saveTour).mockResolvedValue({
      response: { ok: true } as Response,
      data: tour,
    } as any);
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(saveTour).toHaveBeenCalledWith("ecds", tour));
  });

  it("replaces the store and cache with the saved tour", async () => {
    const saved = { ...tour, title: "Saved on server" };
    vi.mocked(saveTour).mockResolvedValue({
      response: { ok: true } as Response,
      data: saved,
    } as any);
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(useTourStore.getState().tour?.title).toBe("Saved on server"),
    );
    expect(
      client.getQueryData<{ tour: TTour }>(["tour", "ecds", "1"])?.tour.title,
    ).toBe("Saved on server");
    expect(useTourStore.getState().lastSaved).toBeDefined();
  });

  it("disables the button while saving", async () => {
    let resolve: (v: any) => void;
    vi.mocked(saveTour).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderButton();
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    resolve!({ response: { ok: true } as Response, data: tour });
    await waitFor(() => expect(button).not.toBeDisabled());
  });

  it("shows field errors and keeps local edits when the save is rejected", async () => {
    useTourStore.getState().updateTourField("title", "");
    vi.mocked(saveTour).mockResolvedValue({
      response: { ok: false } as Response,
      data: { errors: [{ path: "tour.title", detail: "can't be blank" }] },
    } as any);
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith({
        type: "error",
        message: "tour.title: can't be blank",
      }),
    );
    expect(useTourStore.getState().tour?.title).toBe("");
    expect(useTourStore.getState().lastSaved).toBeUndefined();
  });
});
