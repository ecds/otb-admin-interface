import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Field,
  Input,
  Label,
} from "@headlessui/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext, FeedbackContext } from "~/contexts";
import { getErrorMessage } from "~/utils/errors";
import { request } from "~/utils/requests";

// Deleting your own account, after typing your email to confirm. Tours,
// stops, and media you made are kept; only the account and its access go.
const DeleteAccount = () => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const { setFeedback } = useContext(FeedbackContext);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  if (!currentUser) return null;

  const matches =
    typed.trim().toLowerCase() === currentUser.email.toLowerCase();

  const close = () => {
    if (deleting) return;
    setConfirming(false);
    setTyped("");
  };

  const deleteAccount = async () => {
    if (!matches) return;
    setDeleting(true);
    const { response, data } = await request({
      path: "public/v4/admin/users/me",
      method: "DELETE",
    });
    setDeleting(false);

    if (response.ok) {
      setCurrentUser(undefined);
      navigate("/signin", { replace: true });
    } else {
      setConfirming(false);
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Your account couldn't be deleted."),
      });
    }
  };

  return (
    <>
      <p>
        Deleting your account removes your access to every site and tour. The
        tours, stops, and media you made stay as they are. You can sign in again
        later, but you&apos;ll need to ask for access again.
      </p>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="cursor-pointer rounded-md bg-red-700 px-3 py-1 text-white hover:bg-red-900"
      >
        Delete my account
      </button>

      <Dialog open={confirming} onClose={close} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-md bg-white p-8 text-black/75">
            <DialogTitle as="h2" className="text-xl font-semibold text-black">
              Delete your account?
            </DialogTitle>
            <p>
              This can&apos;t be undone. You&apos;ll lose access to every site
              and tour you work on now.
            </p>
            <Field className="flex flex-col gap-1">
              <Label>
                Type <strong className="text-black">{currentUser.email}</strong>{" "}
                to confirm
              </Label>
              <Input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                autoComplete="off"
                className="rounded-md border border-black/40 p-2"
              />
            </Field>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={close}
                disabled={deleting}
                className="cursor-pointer rounded-md border border-black/50 px-3 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={!matches || deleting}
                className="cursor-pointer rounded-md bg-red-700 px-3 py-1 text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete my account"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteAccount;
