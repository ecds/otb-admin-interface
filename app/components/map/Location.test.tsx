import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TStop, TTour } from "~/types";
import Location from "./Location";

vi.mock("@vis.gl/react-google-maps", () => ({
  useMap: () => null,
  useMapsLibrary: () => null,
}));

const stop = {
  id: 3,
  lat: 33.7,
  lng: -84.3,
  address: "Old St",
  parking_lat: 33.6,
  parking_lng: -84.2,
  parking_address: "Lot A",
} as TStop;

const noop = vi.fn();

const renderLocation = (
  props: { lat: number; lng: number; address: string },
  prefix?: "parking",
) =>
  render(
    <Location
      stopId={stop.id}
      {...props}
      prefix={prefix}
      setLat={noop}
      setLng={noop}
      setAddress={noop}
    />,
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

  it("leaves the store alone when the location matches the stored stop", async () => {
    const before = useTourStore.getState().tour;
    renderLocation({ lat: 33.7, lng: -84.3, address: "Old St" });
    await flush();
    expect(useTourStore.getState().tour).toBe(before);
  });

  it("writes a changed location to the store for autosave", async () => {
    renderLocation({ lat: 34, lng: -85, address: "New St" });
    await flush();
    expect(storeStop()).toMatchObject({ lat: 34, lng: -85, address: "New St" });
  });

  it("writes parking latitude and longitude under the correct keys", async () => {
    renderLocation({ lat: 10, lng: 20, address: "Lot B" }, "parking");
    await flush();
    expect(storeStop()).toMatchObject({
      parking_address: "Lot B",
      parking_lat: 10,
      parking_lng: 20,
      lat: 33.7,
      lng: -84.3,
    });
  });
});
