import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TStop, TTour } from "~/types";
import Location from "./Location";

vi.mock("~/utils/requests", () => ({ sendUpdate: vi.fn() }));
vi.mock("@vis.gl/react-google-maps", () => ({
  useMap: () => null,
  useMapsLibrary: () => null,
}));

import { sendUpdate } from "~/utils/requests";

const stop = {
  id: 3,
  lat: 33.7,
  lng: -84.3,
  address: "Old St",
  parking_lat: 33.6,
  parking_lng: -84.2,
  parking_address: "Lot A",
} as TStop;

const setFeedback = vi.fn();
const noop = vi.fn();

const renderLocation = (
  props: { lat: number; lng: number; address: string },
  prefix?: "parking",
) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <Location
        stopId={stop.id}
        {...props}
        prefix={prefix}
        setLat={noop}
        setLng={noop}
        setAddress={noop}
      />
    </FeedbackContext.Provider>,
  );

const flush = async () => {
  await act(async () => {
    vi.advanceTimersByTime(600);
  });
};

const storeStop = () => useTourStore.getState().tour!.stops[0];

describe("Location", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      stops: [{ ...stop }],
    } as unknown as TTour);
  });
  afterEach(() => vi.useRealTimers());

  it("does not save when the location matches the stored stop", async () => {
    renderLocation({ lat: 33.7, lng: -84.3, address: "Old St" });
    await flush();
    expect(sendUpdate).not.toHaveBeenCalled();
  });

  it("saves a changed location and writes it to the store", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderLocation({ lat: 34, lng: -85, address: "New St" });
    await flush();
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 3,
        body: { model: "stop", stop: { address: "New St", lat: 34, lng: -85 } },
      }),
    );
    expect(storeStop()).toMatchObject({ lat: 34, lng: -85, address: "New St" });
  });

  it("sends parking latitude and longitude under the correct keys", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderLocation({ lat: 10, lng: 20, address: "Lot B" }, "parking");
    await flush();
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          model: "stop",
          stop: { parking_address: "Lot B", parking_lat: 10, parking_lng: 20 },
        },
      }),
    );
    expect(storeStop()).toMatchObject({
      parking_lat: 10,
      parking_lng: 20,
      lat: 33.7,
      lng: -84.3,
    });
  });

  it("leaves the store unchanged and reports an error when the save fails", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    } as any);
    renderLocation({ lat: 34, lng: -85, address: "New St" });
    await flush();
    expect(setFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
    expect(storeStop()).toMatchObject({ lat: 33.7, lng: -84.3 });
  });
});
