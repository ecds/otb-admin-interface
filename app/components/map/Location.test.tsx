import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TStop, TTour } from "~/types";
import Location from "./Location";

vi.mock("~/utils/geocode", () => ({
  geocode: vi.fn(),
  rememberAddressedPosition: vi.fn(),
}));

import { geocode, rememberAddressedPosition } from "~/utils/geocode";

const setFeedback = vi.fn();
const stop = () => useTourStore.getState().tour!.stops[0];

const renderLocation = (props: { parking?: boolean } = {}) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <Location stopId={3} address="315 chester ave atl" {...props} />
    </FeedbackContext.Provider>,
  );

const found = {
  ok: true as const,
  result: {
    lat: 33.74,
    lng: -84.36,
    address: "315 Chester Avenue Southeast, Atlanta, GA 30316",
    name: null,
  },
};

describe("Location", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      stops: [{ id: 3, lat: 1, lng: 2, address: "315 chester ave atl" }],
    } as unknown as TTour);
  });

  it("moves the stop to the address and tidies the address", async () => {
    vi.mocked(geocode).mockResolvedValue(found);
    renderLocation();
    fireEvent.click(screen.getByRole("button", { name: /locate address/i }));
    await waitFor(() => expect(stop().lat).toBe(33.74));
    expect(geocode).toHaveBeenCalledWith("ecds", "315 chester ave atl");
    // A later blur of the coordinate fields won't replace this address.
    expect(rememberAddressedPosition).toHaveBeenCalledWith(
      3,
      33.74,
      -84.36,
      false,
    );
    expect(stop()).toMatchObject({
      lng: -84.36,
      address: "315 Chester Avenue Southeast, Atlanta, GA 30316",
    } as Partial<TStop>);
  });

  it("sets the parking location for the parking address", async () => {
    vi.mocked(geocode).mockResolvedValue(found);
    renderLocation({ parking: true });
    fireEvent.click(
      screen.getByRole("button", { name: /locate parking address/i }),
    );
    await waitFor(() => expect(stop().parking_lat).toBe(33.74));
    expect(stop()).toMatchObject({ lat: 1, lng: 2, parking_lng: -84.36 });
  });

  it("reports when nothing is found and leaves the stop alone", async () => {
    vi.mocked(geocode).mockResolvedValue({
      ok: false,
      error: "No location found.",
    });
    renderLocation();
    fireEvent.click(screen.getByRole("button", { name: /locate address/i }));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith({
        type: "error",
        message: "No location found.",
      }),
    );
    expect(stop()).toMatchObject({ lat: 1, lng: 2 });
  });
});
