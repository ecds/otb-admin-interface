import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { request } from "~/utils/requests";
import { useTourStore } from "~/store/tourStore";
import type { TTour, TTravelMode } from "~/types";

type TourQueryResult = {
  tour: TTour;
  modes: TTravelMode[];
};

// Retry on 404 to handle Elasticsearch indexing lag after tour creation.
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 10;

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
      if (response.status === 404) throw new Error("not_found");
      const { data: modes } = await request({
        path: `${tourSet}/v4/public/modes`,
      });
      return { tour, modes };
    },
    retry: (failureCount, error) => {
      if (
        (error as Error).message === "not_found" &&
        failureCount < MAX_RETRIES
      )
        return true;
      return false;
    },
    retryDelay: RETRY_DELAY_MS,
    staleTime: Infinity,
  });

  // Sync fetched tour into the store on load and on refetch
  useEffect(() => {
    if (tourQuery.data?.tour) setTour(tourQuery.data.tour);
  }, [tourQuery.data, setTour]);

  // The store holds every edit made since the fetch, so hand it back to the
  // cache on the way out; otherwise returning to this tour would restore the
  // stale first-load snapshot (staleTime is Infinity).
  useEffect(() => {
    const queryKey = ["tour", tourSet, tourId];
    return () => {
      const edited = useTourStore.getState().tour;
      queryClient.setQueryData<TourQueryResult>(queryKey, (cached) =>
        cached && edited && edited.id === cached.tour.id
          ? { ...cached, tour: edited }
          : cached,
      );
      clearTour();
    };
  }, [queryClient, tourSet, tourId, clearTour]);

  return tourQuery;
}
