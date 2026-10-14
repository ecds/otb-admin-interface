import { request } from "./requests";
import { useTourStore } from "~/store/tourStore";

export type TGeocodeResult = {
  lat: number;
  lng: number;
  // Short postal-style address, formatted by the API.
  address: string;
  // Place name, e.g. a business or landmark, when there is one.
  name: string | null;
};

type TGeocodeResponse =
  { ok: true; result: TGeocodeResult } | { ok: false; error: string };

const toResponse = ({
  response,
  data,
}: {
  response: { ok: boolean };
  data: unknown;
}): TGeocodeResponse =>
  response.ok
    ? { ok: true, result: data as TGeocodeResult }
    : {
        ok: false,
        error:
          (data as { error?: string } | undefined)?.error ??
          "The location lookup didn't work. Please try again.",
      };

// Lookups go through the API, which handles the provider's rate limit,
// identification and caching.
export const geocode = async (tenant: string, query: string) =>
  toResponse(
    await request({
      path: `${tenant}/v4/admin/geocode?q=${encodeURIComponent(query)}`,
    }),
  );

export const reverseGeocode = async (
  tenant: string,
  lat: number,
  lng: number,
) =>
  toResponse(
    await request({
      path: `${tenant}/v4/admin/geocode/reverse?lat=${lat}&lng=${lng}`,
    }),
  );

// The position each stop's (or its parking's) address was last set for, by
// a lookup or because the stop was opened there.
const addressedAt = new Map<string, string>();
const positionKey = (stopId: number, parking: boolean) =>
  `${stopId}:${parking ? "parking" : "stop"}`;

export const rememberAddressedPosition = (
  stopId: number,
  lat: number | null | undefined,
  lng: number | null | undefined,
  parking = false,
) => {
  if (lat != null && lng != null)
    addressedAt.set(positionKey(stopId, parking), `${lat},${lng}`);
};

// Fill in the address for a stop's new position (after a drag, a map click,
// or typed coordinates). With onlyIfMoved, nothing happens unless the
// position differs from where the address was last set. Skipped if the
// position changes again before the lookup returns, so a slow response
// can't overwrite a newer address.
export const updateAddressFromPosition = async (
  stopId: number,
  lat: number,
  lng: number,
  parking = false,
  { onlyIfMoved = false } = {},
) => {
  const { tour, updateStopField } = useTourStore.getState();
  if (!tour) return;

  const key = positionKey(stopId, parking);
  if (onlyIfMoved && addressedAt.get(key) === `${lat},${lng}`) return;
  addressedAt.set(key, `${lat},${lng}`);

  const found = await reverseGeocode(tour.tenant, lat, lng);
  if (!found.ok) return;

  const stop = useTourStore.getState().tour?.stops.find((s) => s.id === stopId);
  const [latKey, lngKey] = parking
    ? (["parking_lat", "parking_lng"] as const)
    : (["lat", "lng"] as const);
  if (stop?.[latKey] !== lat || stop?.[lngKey] !== lng) return;

  updateStopField(
    stopId,
    parking ? "parking_address" : "address",
    found.result.address,
  );
};
