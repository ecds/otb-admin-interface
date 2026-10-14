import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";

vi.mock("./requests", () => ({ request: vi.fn() }));

import { request } from "./requests";
import {
  geocode,
  rememberAddressedPosition,
  updateAddressFromPosition,
} from "./geocode";

const ok = (data: unknown) =>
  ({ response: { ok: true }, data }) as Awaited<ReturnType<typeof request>>;
const stop = () => useTourStore.getState().tour!.stops[0];

describe("geocode helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      stops: [{ id: 3, lat: 10, lng: 20, address: "Old" }],
    } as unknown as TTour);
  });

  it("encodes the search query", async () => {
    vi.mocked(request).mockResolvedValue(ok({}));
    await geocode("ecds", "315 Chester Ave & 5th");
    expect(request).toHaveBeenCalledWith({
      path: "ecds/v4/admin/geocode?q=315%20Chester%20Ave%20%26%205th",
    });
  });

  it("passes on the API's error message", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: false },
      data: { error: "No location found." },
    } as Awaited<ReturnType<typeof request>>);
    expect(await geocode("ecds", "x")).toEqual({
      ok: false,
      error: "No location found.",
    });
  });

  it("fills in the address for a moved marker", async () => {
    vi.mocked(request).mockResolvedValue(ok({ address: "New" }));
    await updateAddressFromPosition(3, 10, 20);
    expect(request).toHaveBeenCalledWith({
      path: "ecds/v4/admin/geocode/reverse?lat=10&lng=20",
    });
    expect(stop().address).toBe("New");
  });

  it("fills in the parking address for the parking marker", async () => {
    useTourStore.getState().updateStopField(3, "parking_lat", 11);
    useTourStore.getState().updateStopField(3, "parking_lng", 21);
    vi.mocked(request).mockResolvedValue(ok({ address: "Lot" }));
    await updateAddressFromPosition(3, 11, 21, true);
    expect(stop()).toMatchObject({ parking_address: "Lot", address: "Old" });
  });

  it("ignores a lookup the marker has already moved on from", async () => {
    vi.mocked(request).mockImplementation(async () => {
      useTourStore.getState().updateStopField(3, "lat", 99);
      return ok({ address: "Stale" });
    });
    await updateAddressFromPosition(3, 10, 20);
    expect(stop().address).toBe("Old");
  });

  describe("onlyIfMoved", () => {
    it("skips a position the address was already set for", async () => {
      rememberAddressedPosition(3, 10, 20);
      await updateAddressFromPosition(3, 10, 20, false, { onlyIfMoved: true });
      expect(request).not.toHaveBeenCalled();
      expect(stop().address).toBe("Old");
    });

    it("looks up a position that has changed", async () => {
      rememberAddressedPosition(3, 10, 20);
      useTourStore.getState().updateStopField(3, "lat", 11);
      vi.mocked(request).mockResolvedValue(ok({ address: "Moved" }));
      await updateAddressFromPosition(3, 11, 20, false, { onlyIfMoved: true });
      expect(stop().address).toBe("Moved");
    });

    it("counts a drag's lookup as the latest, so a later blur doesn't repeat it", async () => {
      useTourStore.getState().updateStopField(3, "lat", 12);
      vi.mocked(request).mockResolvedValue(ok({ address: "Dragged" }));
      await updateAddressFromPosition(3, 12, 20);
      await updateAddressFromPosition(3, 12, 20, false, { onlyIfMoved: true });
      expect(request).toHaveBeenCalledTimes(1);
    });

    it("tracks the parking position separately", async () => {
      rememberAddressedPosition(3, 10, 20);
      useTourStore.getState().updateStopField(3, "parking_lat", 10);
      useTourStore.getState().updateStopField(3, "parking_lng", 20);
      vi.mocked(request).mockResolvedValue(ok({ address: "Lot" }));
      await updateAddressFromPosition(3, 10, 20, true, { onlyIfMoved: true });
      expect(stop().parking_address).toBe("Lot");
    });
  });
});
