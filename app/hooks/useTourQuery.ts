import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { request } from "~/utils/requests";
import { useTourStore } from "~/store/tourStore";
import type { TTour, TTravelMode } from "~/types";

type TourQueryResult = {
  tour: TTour;
  // Set when the editor was left with edits the server hadn't confirmed yet.
  saved?: TTour;
  modes: TTravelMode[];
};

export function useTourQuery(tourSet: string, tourId: string) {
  const setTour = useTourStore((s) => s.setTour);
  const clearTour = useTourStore((s) => s.clearTour);
  const queryClient = useQueryClient();

  const tourQuery = useQuery<TourQueryResult>({
    queryKey: ["tour", tourSet, tourId],
    queryFn: async () => {
      const { data: tour, response } = await request({
        path: `${tourSet}/v4/admin/tours/${tourId}`,
      });
      if (!response.ok) throw new Error(`tour request failed`);
      const { data: modes } = await request({
        path: `${tourSet}/v4/public/modes`,
      });
      return { tour, modes };
    },
    retry: false,
    staleTime: Infinity,
  });

  // Sync fetched tour into the store on load and on refetch
  useEffect(() => {
    if (tourQuery.data?.tour)
      setTour(tourQuery.data.tour, tourQuery.data.saved);
  }, [tourQuery.data, setTour]);

  // The store holds every edit made since the fetch, so hand it back to the
  // cache on the way out; otherwise returning to this tour would restore the
  // stale first-load snapshot (staleTime is Infinity). The saved baseline
  // goes with it so anything not yet confirmed is sent again.
  useEffect(() => {
    const queryKey = ["tour", tourSet, tourId];
    return () => {
      const { tour: edited, saved } = useTourStore.getState();
      queryClient.setQueryData<TourQueryResult>(queryKey, (cached) =>
        cached && edited && saved && edited.id === cached.tour.id
          ? { ...cached, tour: edited, saved }
          : cached,
      );
      clearTour();
    };
  }, [queryClient, tourSet, tourId, clearTour]);

  return tourQuery;
}
