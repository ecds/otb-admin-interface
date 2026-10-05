import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { useParams } from "react-router";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { saveTour } from "~/utils/requests";
import type { TTour } from "~/types";

type TSaveError = { path: string; detail: string };

const SaveButton = () => {
  const { tourSet, tour_id } = useParams<{
    tourSet: string;
    tour_id: string;
  }>();
  const isSaving = useTourStore((s) => s.pendingSaves > 0);
  const lastSaved = useTourStore((s) => s.lastSaved);
  const { setFeedback } = useContext(FeedbackContext);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    const { tour, beginSave, endSave, setTour } = useTourStore.getState();
    if (!tour) return;

    beginSave();
    const { response, data } = await saveTour(tour.tenant, tour);
    endSave(response.ok);

    if (response.ok) {
      const saved = data as TTour;
      setTour(saved);
      queryClient.setQueryData<{ tour: TTour }>(
        ["tour", tourSet, tour_id],
        (cached) => (cached ? { ...cached, tour: saved } : cached),
      );
      setFeedback(undefined);
    } else {
      const errors: TSaveError[] = data?.errors ?? [];
      setFeedback({
        type: "error",
        message:
          errors.length > 0
            ? errors.map((e) => `${e.path}: ${e.detail}`).join(" ")
            : "Could not save the tour. Please try again.",
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg capitalize disabled:opacity-50 disabled:cursor-wait"
      >
        Save
      </button>
      <div className="my-auto">
        {isSaving ? (
          <>
            Saving
            <FontAwesomeIcon icon={faSpinner} spin={true} />
          </>
        ) : (
          lastSaved && (
            <>
              <span className="font-semibold">Last Saved:</span> {lastSaved}
            </>
          )
        )}
      </div>
    </>
  );
};

export default SaveButton;
