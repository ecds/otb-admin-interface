import { Description, Dialog, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import {
  useEffect,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useRevalidator } from "react-router";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
  title: string;
  description?: string;
}

const ScrollableModal = ({
  isOpen,
  setIsOpen,
  title,
  description,
  children,
}: Props) => {
  const openRef = useRef<boolean | undefined>(undefined);
  const revalidator = useRevalidator();

  useEffect(() => {
    if (isOpen) openRef.current = true;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && openRef.current) {
      revalidator.revalidate();
      openRef.current = undefined;
    }
  }, [isOpen, revalidator]);

  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="w-[80vw] h-[80vh] space-y-4 border bg-white overflow-hidden">
          <div className="grid grid-cols-2 p-4">
            {title}
            <button
              onClick={() => setIsOpen(false)}
              className="flex flex-col items-center text-xs justify-self-end"
            >
              <FontAwesomeIcon icon={faCircleXmark} className="text-base" />
              Close
            </button>
            {description && (
              <Description className="capitalize">{description}</Description>
            )}
          </div>
          <div className="overflow-scroll h-full pb-44 p-4">
            <div className="relative overflow-x-auto shadow-xs">{children}</div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ScrollableModal;
