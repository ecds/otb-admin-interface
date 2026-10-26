import { useContext, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext, FeedbackContext } from "~/contexts";
import { request } from "~/utils/requests";
import type { TMedium } from "~/types";

interface Props {
  tenant: string;
  medium: TMedium;
  // Called once the image is gone.
  onDeleted: () => void;
}

// Deletes one unused image, after confirming. Site admins only; the API
// refuses if the image has been added to a tour or stop since.
const DeleteMedium = ({ tenant, medium, onDeleted }: Props) => {
  const { currentUser, currentTenantAdmin } = useContext(AuthContext);
  const { setFeedback } = useContext(FeedbackContext);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!currentUser?.super && !currentTenantAdmin) return null;

  const name = medium.title || medium.filename;

  const deleteMedium = async () => {
    setDeleting(true);
    const { response } = await request({
      path: `${tenant}/v4/admin/media/${medium.id}`,
      method: "DELETE",
    });
    setDeleting(false);
    setConfirming(false);

    if (response.ok) {
      setFeedback(undefined);
      onDeleted();
    } else if (response.status === 409) {
      setFeedback({
        type: "error",
        message: `${name} is now used in a tour or stop, so it wasn't deleted.`,
      });
    } else {
      setFeedback({
        type: "error",
        message: `${name} couldn't be deleted. Please try again.`,
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-md bg-red-700 p-2 text-white hover:bg-red-900"
      >
        <FontAwesomeIcon icon={faTrash} aria-hidden="true" /> Delete image
      </button>

      <Dialog
        open={confirming}
        onClose={() => !deleting && setConfirming(false)}
        className="relative z-60"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-md bg-white p-8 text-black/75">
            <DialogTitle className="text-xl font-semibold text-black">
              Delete {name}?
            </DialogTitle>
            <p>
              It&apos;ll be removed from this site, with its file, for good.
              This can&apos;t be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                // First in the dialog, so it has focus when the dialog opens.
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="cursor-pointer rounded-sm bg-blue-500 px-3 py-1 text-white hover:bg-blue-300 hover:text-black disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteMedium}
                disabled={deleting}
                className="cursor-pointer rounded-sm bg-red-700 px-3 py-1 text-white hover:bg-red-900 disabled:cursor-wait disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteMedium;
