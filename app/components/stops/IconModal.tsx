import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TV3MapIcon, TV3MapIconResponse } from "~/types";
import type { Dispatch, SetStateAction } from "react";
import { sendUpdate, type UpdateBody } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";

export type TIconTarget = { model: "tour" | "tour_stop"; recordId: number };

interface Props {
  target: TIconTarget;
  onSelect: (url: string) => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const IconModal = ({ target, onSelect, open, setOpen }: Props) => {
  const [icons, setIcons] = useState<TV3MapIcon[] | undefined>(undefined);
  const tenant = useTourStore((s) => s.tour?.tenant);
  const tourId = useTourStore((s) => s.tour?.id);
  const { setFeedback } = useContext(FeedbackContext);

  useEffect(() => {
    const fetchIcons = async () => {
      const response = await fetch(
        `https://api.opentour.site/${tenant}/map-icons`,
      );
      if (response.ok) {
        const data: TV3MapIconResponse = await response.json();
        setIcons(data.data);
      } else {
        setFeedback({
          type: "error",
          message: "Could not load map icons. Please try again.",
        });
      }
    };

    if (open && tenant) fetchIcons();
  }, [tenant, open, setFeedback]);

  const addIcon = async (icon: TV3MapIcon) => {
    if (!tenant || !tourId) return;
    const body: UpdateBody = {
      model: target.model,
      // The API assigns the looked-up MapIcon record to this attribute, so it
      // must be the association, not the _id column.
      attribute: "map_icon",
      value: icon.id,
      related_model: "map_icon",
      related_type: "belongs_to",
      reindex: {
        model: "tour",
        id: tourId,
      },
    };

    const { response, data } = await sendUpdate({
      tenant,
      record: target.recordId,
      body,
    });
    if (response.ok) {
      onSelect(icon.attributes.original_image_url);
      setOpen(false);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not set the map icon."),
      });
    }
  };

  if (icons) {
    return (
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-4xl space-y-4 bg-white p-8">
            <DialogTitle className="font-bold">Map Icons</DialogTitle>
            <Description>Choose a map icon</Description>
            <ul className="flex flex-row flex-wrap gap-8">
              {icons.map((icon) => {
                return (
                  <li key={icon.id}>
                    <button onClick={() => addIcon(icon)}>
                      <img src={icon.attributes.original_image_url} alt="" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </DialogPanel>
        </div>
      </Dialog>
    );
  }
  return <></>;
};

export default IconModal;
