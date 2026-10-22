import { request } from "./requests";
import type { TOpenGeographiesPreview } from "~/types";

export type TOpenGeographiesResult =
  { ok: true; preview: TOpenGeographiesPreview } | { ok: false; error: string };

// The API fetches and checks the tour's Open Geographies source. refresh
// skips its short cache; url checks a source that hasn't been saved yet.
export const fetchOpenGeographiesPreview = async (
  tenant: string,
  tourId: number,
  refresh = false,
  url?: string,
): Promise<TOpenGeographiesResult> => {
  const query = new URLSearchParams();
  if (refresh) query.set("refresh", "true");
  if (url) query.set("url", url);
  const search = query.toString();
  const { response, data } = await request({
    path: `${tenant}/v4/admin/tours/${tourId}/open_geographies${search ? `?${search}` : ""}`,
  });
  if (response.ok)
    return { ok: true, preview: data as TOpenGeographiesPreview };
  return {
    ok: false,
    error:
      (data as { error?: string } | undefined)?.error ??
      "Couldn't load the Open Geographies stops. Please try again.",
  };
};
