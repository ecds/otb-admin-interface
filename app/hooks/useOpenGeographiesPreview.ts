import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { useTourStore } from "~/store/tourStore";
import { fetchOpenGeographiesPreview } from "~/utils/openGeographies";
import type { TOpenGeographiesPreview } from "~/types";

type PreviewState = {
  // tenant/tour/URL the state below belongs to.
  key?: string;
  status: "idle" | "loading" | "ready" | "error";
  preview?: TOpenGeographiesPreview;
  error?: string;
};

// Shared so the stops panel and the Map Options map make one request and
// show the same result.
export const useOpenGeographiesStore = create<PreviewState>(() => ({
  status: "idle",
}));

const load = async (
  key: string,
  tenant: string,
  tourId: number,
  refresh: boolean,
) => {
  const current = useOpenGeographiesStore.getState();
  // Already loaded or loading for this source (unless refreshing).
  if (!refresh && current.key === key && current.status !== "error") return;

  useOpenGeographiesStore.setState({
    key,
    status: "loading",
    // Keep showing the last result for this source while it reloads.
    preview: current.key === key ? current.preview : undefined,
    error: undefined,
  });
  const result = await fetchOpenGeographiesPreview(tenant, tourId, refresh);
  // The tour or its source changed while this was loading.
  if (useOpenGeographiesStore.getState().key !== key) return;
  useOpenGeographiesStore.setState(
    result.ok
      ? { status: "ready", preview: result.preview }
      : { status: "error", error: result.error },
  );
};

// The open tour's Open Geographies preview, loaded for its saved source
// (not the one being typed). Nothing is loaded without a source.
export function useOpenGeographiesPreview() {
  const tenant = useTourStore((s) => s.tour?.tenant);
  const tourId = useTourStore((s) => s.tour?.id);
  const endpoint = useTourStore((s) => s.saved?.open_geographies_endpoint);
  const key =
    tenant && tourId && endpoint
      ? `${tenant}/${tourId}/${endpoint}`
      : undefined;
  const state = useOpenGeographiesStore();

  useEffect(() => {
    if (key && tenant && tourId) void load(key, tenant, tourId, false);
  }, [key, tenant, tourId]);

  const refresh = useCallback(() => {
    if (key && tenant && tourId) void load(key, tenant, tourId, true);
  }, [key, tenant, tourId]);

  // Ignore anything left over from another tour or source.
  const current = key && state.key === key;
  return {
    endpoint,
    status: current ? state.status : key ? "loading" : "idle",
    preview: current ? state.preview : undefined,
    error: current ? state.error : undefined,
    refresh,
  } as const;
}
