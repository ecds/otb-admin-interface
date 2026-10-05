import { useTourStore } from "~/store/tourStore";
import type { TVoiceOver } from "~/types";

const EMPTY: TVoiceOver[] = [];

// Voice overs belong to either a stop (when stopId is given) or the tour.
export function useVoiceOvers(stopId?: number) {
  const voiceOvers = useTourStore((s) =>
    stopId
      ? (s.tour?.stops.find((stop) => stop.id === stopId)?.voice_overs ?? EMPTY)
      : (s.tour?.voice_overs ?? EMPTY),
  );
  const updateTourField = useTourStore((s) => s.updateTourField);
  const updateStopField = useTourStore((s) => s.updateStopField);

  const setVoiceOvers = (update: (current: TVoiceOver[]) => TVoiceOver[]) => {
    const tour = useTourStore.getState().tour;
    if (!tour) return;
    if (stopId) {
      const stop = tour.stops.find((s) => s.id === stopId);
      updateStopField(
        stopId,
        "voice_overs",
        update(stop?.voice_overs ?? EMPTY),
      );
    } else {
      updateTourField("voice_overs", update(tour.voice_overs ?? EMPTY));
    }
  };

  return { voiceOvers, setVoiceOvers };
}
