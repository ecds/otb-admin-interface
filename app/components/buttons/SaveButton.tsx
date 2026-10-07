import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { buildTourPatch } from "~/store/tourPatch";
import { flushTour } from "~/utils/autosave";

// Edits save on their own; this sends anything still waiting right away.
const SaveButton = () => {
  const isSaving = useTourStore((s) => s.pendingSaves > 0);
  const lastSaved = useTourStore((s) => s.lastSaved);
  const saveError = useTourStore((s) => s.saveError);
  // Enabled only when there's something to send, or a failed save to retry.
  const hasChanges = useTourStore(
    (s) =>
      !!s.saveError ||
      (!!s.tour &&
        !!s.saved &&
        s.tour !== s.saved &&
        buildTourPatch(s.saved, s.tour) !== null),
  );
  const { setFeedback } = useContext(FeedbackContext);

  useEffect(() => {
    if (saveError) setFeedback({ type: "error", message: saveError });
  }, [saveError, setFeedback]);

  const handleSave = async () => {
    if (await flushTour()) setFeedback(undefined);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !hasChanges}
        title={hasChanges ? undefined : "All changes saved"}
        className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg capitalize disabled:opacity-50 disabled:cursor-default disabled:hover:bg-blue-500 disabled:hover:text-white"
      >
        {hasChanges || isSaving ? "Save" : "Saved"}
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
