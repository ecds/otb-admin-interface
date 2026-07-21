import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext } from "react";
import { ErrorContext } from "~/contexts";

const Error = () => {
  const { error, setError } = useContext(ErrorContext);
  return (
    <Dialog
      open={Boolean(error)}
      onClose={() => {
        if (setError) setError(undefined);
      }}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <DialogTitle className="font-bold text-red-600">Error</DialogTitle>
          <Description>{error}</Description>
          <p>Please try again. Contact ECDS if the issue continues.</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (setError) setError(undefined);
              }}
              className="bg-blue-500 p-2 text-white cursor-pointer rounded-md"
            >
              Ok
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Error;
