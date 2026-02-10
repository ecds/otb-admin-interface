import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useContext } from "react";
import { FeedbackContext } from "~/contexts";

const Feedback = () => {
  const { feedback, setFeedback } = useContext(FeedbackContext);
  return (
    <Dialog open={Boolean(feedback)} onClose={() => setFeedback(undefined)}>
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <p
            className={`text-center text-2xl text-${feedback?.type === "success" ? "green" : "red"}-500`}
          >
            {feedback?.message}
          </p>
          {feedback?.type == "error" && (
            <div className="flex flex-row justify-end">
              <button onClick={() => setFeedback(undefined)}>Dismiss</button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Feedback;
