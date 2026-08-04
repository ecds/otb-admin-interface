import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Input,
  Label,
} from "@headlessui/react";
import { useContext, useRef, useState } from "react";
import { useRevalidator } from "react-router";
import { AuthContext, FeedbackContext } from "~/contexts";
import InputWrapper from "./inputs/InputWrapper";
import { sendCreate } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";

const CreateTourSet = () => {
  const { currentUser } = useContext(AuthContext);
  const [show, setShow] = useState<boolean>(false);
  const [siteName, setSiteName] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFeedback } = useContext(FeedbackContext);
  const revalidator = useRevalidator();

  const handleChange = () => {
    if (!inputRef.current) return;
    setSiteName(inputRef.current.value);
  };

  const createSite = async () => {
    if (!inputRef.current) return;
    setShow(false);
    setFeedback({ type: "success", message: `Creating ${siteName}` });
    const { response, data } = await sendCreate({
      tenant: "public",
      body: {
        model: "tour_set",
        tour_set: {
          name: siteName,
        },
      },
    });

    if (response.ok) {
      setSiteName(undefined);
      setFeedback(undefined);
      revalidator.revalidate();
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create the new site."),
      });
    }
  };

  const cancel = () => {
    setSiteName(undefined);
    setShow(false);
  };

  if (!currentUser || !currentUser.super) return <></>;

  return (
    <>
      <button
        className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg mb-8"
        onClick={() => setShow(!show)}
      >
        <FontAwesomeIcon icon={faPlus} /> Create New
      </button>
      <Dialog
        open={show}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={() => setShow(false)}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />{" "}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="max-w-lg space-y-4 bg-white p-12"
            >
              <DialogTitle className="font-bold">Create New Site</DialogTitle>
              <InputWrapper>
                <Label
                  className="block mb-2.5 font-medium text-black/75"
                  htmlFor="site-name"
                >
                  New Site Name
                </Label>
                <Input
                  ref={inputRef}
                  value={siteName}
                  onChange={handleChange}
                  id="site-name"
                  type="text"
                  className={`w-full border border-default-medium border-gray-300 text-heading text-base rounded-base focus:ring-blue-100 focus:border-blue-100 block rounded-md shadow-xs placeholder:text-body`}
                />
              </InputWrapper>
              <div className="flex gap-4">
                <Button
                  className="px-4 py-2 text-sm font-medium text-gray-700  hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  onClick={cancel}
                >
                  Cancel
                </Button>
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                  onClick={createSite}
                >
                  Create Site!
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CreateTourSet;
