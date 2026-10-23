import { useState } from "react";
import {
  Checkbox,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Label,
} from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { useTourStore } from "~/store/tourStore";
import { missingAltText } from "~/utils/altText";
import ToolTip from "./inputs/ToolTip";

// The tour's Published setting. Publishing a tour with images that have no
// alt text (and aren't decorative) asks first, listing them.
const PublishToggle = () => {
  const published = useTourStore((s) => Boolean(s.tour?.published));
  const updateTourField = useTourStore((s) => s.updateTourField);
  const [missing, setMissing] = useState<ReturnType<typeof missingAltText>>([]);

  const toggle = (next: boolean) => {
    const tour = useTourStore.getState().tour;
    if (!tour) return;
    const needing = next ? missingAltText(tour) : [];
    if (needing.length > 0) setMissing(needing);
    else updateTourField("published", next);
  };

  const publishAnyway = () => {
    setMissing([]);
    updateTourField("published", true);
  };

  return (
    <>
      <Field className="mb-8 flex items-center space-x-4">
        <Checkbox
          className="group block cursor-pointer"
          checked={published}
          onChange={toggle}
        >
          <FontAwesomeIcon
            icon={published ? faSquareCheck : faSquare}
            className="group-data-checked:text-blue-500 text-2xl"
          />
        </Checkbox>
        <Label className="font-medium text-black/75 select-none">
          Published
        </Label>
        <Description as="div">
          <ToolTip>Toggle to make tour publicly available.</ToolTip>
        </Description>
      </Field>

      <Dialog
        open={missing.length > 0}
        onClose={() => setMissing([])}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-md bg-white p-8 text-black/75">
            <DialogTitle className="text-xl font-semibold text-black">
              {missing.length}{" "}
              {missing.length === 1 ? "image needs" : "images need"} alt text
            </DialogTitle>
            <p>
              Images without alt text can&apos;t be understood by people using
              screen readers. Add alt text, or mark an image as decorative if it
              adds nothing they need.
            </p>
            <ul className="max-h-64 list-disc overflow-y-auto ps-6">
              {missing.map(({ medium, usedIn }) => (
                <li key={medium.id}>
                  {medium.title || medium.filename}{" "}
                  <span className="text-black/60">({usedIn.join(", ")})</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                // First in the dialog, so it has focus when the dialog opens.
                onClick={() => setMissing([])}
                className="cursor-pointer rounded-sm bg-blue-500 px-3 py-1 text-white hover:bg-blue-300 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={publishAnyway}
                className="cursor-pointer rounded-sm px-3 py-1 text-red-700 hover:underline"
              >
                Publish anyway
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default PublishToggle;
