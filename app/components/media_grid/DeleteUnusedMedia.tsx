import { useContext, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext, FeedbackContext } from "~/contexts";
import { request } from "~/utils/requests";

interface Props {
  tenant: string;
  // How many unused images the list shows.
  count: number;
  // Called once the deletion has been queued.
  onQueued: () => void;
}

// Deletes every unused image in the site, after confirming. Site admins
// only; the API decides which images are unused when it runs, so anything
// added to a tour or stop in the meantime is kept.
const DeleteUnusedMedia = ({ tenant, count, onQueued }: Props) => {
  const { currentUser, currentTenantAdmin } = useContext(AuthContext);
  const { setFeedback } = useContext(FeedbackContext);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!currentUser?.super && !currentTenantAdmin) return null;

  const images = `${count} unused ${count === 1 ? "image" : "images"}`;

  const deleteUnused = async () => {
    setDeleting(true);
    const { response } = await request({
      path: `${tenant}/v4/admin/media/unused`,
      method: "DELETE",
    });
    setDeleting(false);
    setConfirming(false);

    if (response.ok) {
      setFeedback({
        type: "success",
        message: `Deleting ${images}. They'll disappear from this list shortly.`,
      });
      onQueued();
    } else {
      setFeedback({
        type: "error",
        message: "The unused images couldn't be deleted. Please try again.",
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-sm bg-red-700 px-3 py-1 text-white hover:bg-red-900"
      >
        <FontAwesomeIcon icon={faTrash} aria-hidden="true" /> Delete all{" "}
        {images}
      </button>

      <Dialog
        open={confirming}
        onClose={() => !deleting && setConfirming(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-md bg-white p-8 text-black/75">
            <DialogTitle className="text-xl font-semibold text-black">
              Delete {images}?
            </DialogTitle>
            <p>
              They&apos;ll be removed from this site, with their files, for
              good. This can&apos;t be undone. Any image added to a tour or stop
              in the meantime is kept.
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
                onClick={deleteUnused}
                disabled={deleting}
                className="cursor-pointer rounded-sm bg-red-700 px-3 py-1 text-white hover:bg-red-900 disabled:cursor-wait disabled:opacity-50"
              >
                {deleting ? "Deleting…" : `Delete ${images}`}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteUnusedMedia;
