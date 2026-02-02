import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import { RecordContext, StopMapContext } from "~/contexts";
import type { TV3MapIcon, TV3MapIconResponse } from "~/types";
import type { Dispatch, SetStateAction } from "react";
import { sendUpdate, type UpdateBody } from "~/utils/requests";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const IconModal = ({ open, setOpen }: Props) => {
  const [icons, setIcons] = useState<TV3MapIcon[] | undefined>(undefined);
  const { tenant, tour } = useContext(RecordContext);
  const context = useContext(StopMapContext);
  if (!context) throw new Error("StopMapContext is undefined");
  const { setMapIcon, stop } = context;

  useEffect(() => {
    const fetchIcons = async () => {
      const response = await fetch(
        `https://api.opentour.site/${tenant}/map-icons`,
      );
      if (response.ok) {
        const data: TV3MapIconResponse = await response.json();
        setIcons(data.data);
      }
    };

    if (tenant) fetchIcons();
  }, [tenant]);

  const addIcon = async (icon: TV3MapIcon) => {
    if (!stop || !tour) return;
    const body: UpdateBody = {
      model: "stop",
      attribute: "map_icon_id",
      value: icon.id,
      related_model: "map_icon",
      related_type: "belongs_to",
      reindex: {
        model: "tour",
        id: tour.id,
      },
    };

    const { response } = await sendUpdate({ tenant, record: stop.id, body });
    if (response.ok && setMapIcon) {
      setMapIcon(icon.attributes.original_image_url);
      setOpen(false);
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
            <Description>Set Map Icon for Sto</Description>
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
