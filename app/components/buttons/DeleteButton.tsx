import {
  faTrash,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { useState, type ReactNode } from "react";

const DeleteButton = ({
  children,
  removing,
  className,
  disabled = false,
  label,
  icon = faTrash,
  description,
  message,
  iconClassName,
  onDelete,
}: {
  children?: ReactNode;
  removing: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  icon?: IconDefinition;
  description?: string;
  message?: string;
  iconClassName?: string;
  onDelete?: () => void;
}) => {
  const [askConfirm, setAskConfirm] = useState<boolean>(false);

  const deleteRecord = async () => {
    onDelete?.();
    setAskConfirm(false);
  };

  return (
    <>
      <Button
        aria-label={label ?? `Delete ${removing}`}
        className={
          className ??
          "cursor-pointer bg-red-300 hover:bg-red-500 h-8 text-black/75 hover:text-white/75 px-2 rounded-sm drop-shadow-lg"
        }
        onClick={() => setAskConfirm(true)}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={icon} className={iconClassName} />{" "}
        {children ?? "Delete"}
      </Button>
      <Dialog
        open={askConfirm}
        onClose={() => setAskConfirm(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
            <Description>
              {description ?? `Remove this ${removing}?`}
            </Description>
            <p>
              {message ?? `Are you sure you want to remove this ${removing}`}{" "}
              from the tour.
            </p>
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
