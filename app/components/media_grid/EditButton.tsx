import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import { FormContext } from "~/contexts";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  onClick: Dispatch<SetStateAction<boolean>>;
}

const EditButton = ({ onClick }: Props) => {
  const { recordId, handleDelete } = useContext(FormContext);
  const [askConfirm, setAskConfirm] = useState<boolean>(false);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (confirmed) {
      handleDelete(recordId);
    }
    setAskConfirm(false);
  }, [confirmed, handleDelete, recordId]);

  return (
    <>
      <button
        className="cursor-pointer bg-blue-300 hover:bg-blue-500 h-8 text-black/75 hover:text-white/75 px-2 rounded-sm drop-shadow-lg"
        onClick={() => onClick(true)}
      >
        <FontAwesomeIcon icon={faPencil} /> Edit
      </button>
      <Dialog
        open={askConfirm}
        onClose={() => setAskConfirm(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <Description>Remove this image or video?</Description>
            <p>Are you sure you want to this image or video from the tour.</p>
            <div className="flex gap-4">
              <button onClick={() => setAskConfirm(false)}>Cancel</button>
              <button onClick={() => setConfirmed(true)}>Delete</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default EditButton;
