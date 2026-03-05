import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { useContext, useState, type ReactNode } from "react";
import { FormContext } from "~/contexts";

const DeleteButton = ({
  children,
  removing,
  className,
  disabled = false,
}: {
  children?: ReactNode;
  removing: string;
  className?: string;
  disabled?: boolean;
}) => {
  const { recordId, handleDelete } = useContext(FormContext);
  const [askConfirm, setAskConfirm] = useState<boolean>(false);

  const deleteRecord = async () => {
    if (handleDelete && recordId) handleDelete(recordId);
    setAskConfirm(false);
  };

  return (
    <>
      <button
        className={
          className ??
          "cursor-pointer bg-red-300 hover:bg-red-500 h-8 text-black/75 hover:text-white/75 px-2 rounded-sm drop-shadow-lg"
        }
        onClick={() => setAskConfirm(true)}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={faTrash} /> {children ?? "Delete"}
      </button>
      <Dialog
        open={askConfirm}
        onClose={() => setAskConfirm(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <Description>Remove this {removing}?</Description>
            <p>Are you sure you want to this {removing} from the tour.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="p-2 rounded-md border border-black/75 cursor-pointer"
                onClick={() => setAskConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-400 text-white p-2 rounded-md cursor-pointer"
                onClick={deleteRecord}
              >
                Delete
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteButton;
