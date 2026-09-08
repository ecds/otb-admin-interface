import {
  Button,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Label,
  Select,
} from "@headlessui/react";
import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import InputWrapper from "~/components/inputs/InputWrapper";
import { AuthContext, FeedbackContext, FormContext } from "~/contexts";
import { request } from "~/utils/requests";
import Navbar from "~/components/Navbar";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import DeleteButton from "~/components/buttons/DeleteButton";
import AccessRequestForm from "~/components/AccessRequestForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { TTourSet } from "~/types";

export const clientLoader = async () => {
  const { data } = await request({
    path: "public/v4/admin/tour_sets",
  });
  return { tourSets: data };
};

clientLoader.hydrate = true as const;

const AccessRequestRoute = () => {
  const { tourSets } = useLoaderData<{
    tourSets: TTourSet[];
  }>();
  const { currentUser } = useContext(AuthContext);
  const { feedback, setFeedback } = useContext(FeedbackContext);
  const [filteredTourSets, setFilteredTourSets] = useState<
    TTourSet[] | undefined
  >(undefined);
  const [value, setValue] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<TTourSet | undefined>(
    undefined,
  );
  const [askConfirm, setAskConfirm] = useState<boolean>(false);
  const revalidator = useRevalidator();
  const requestSent = useRef<boolean>(false);

  useEffect(() => {
    if (!currentUser || currentUser.super) return;

    setFilteredTourSets(
      tourSets.filter(
        (ts) =>
          !currentUser?.tour_sets
            .map((uts) => uts.subdir)
            .includes(ts.subdir) &&
          !currentUser.access_requests
            ?.map((request) => request.site)
            .includes(ts.name),
      ),
    );
  }, [currentUser, tourSets]);

  useEffect(() => {
    if (!feedback) {
      setValue("");
      setSelectedSite(undefined);
      setAskConfirm(false);
      if (requestSent.current) {
        revalidator.revalidate();
        requestSent.current = false;
      }
    }
  }, [feedback, revalidator]);

  const startRequest = (value: string) => {
    setSelectedSite(tourSets.find((set) => set.subdir === value));
    setAskConfirm(true);
    setValue(value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!currentUser || !selectedSite) return;

    setFeedback({ type: "success", message: "Sending Request" });
    const { data, response } = await request({
      path: `${selectedSite.subdir}/v4/admin/access_requests`,
      method: "POST",
      body: {
        user: currentUser.id,
        tour_ids: formData.getAll("tour_ids"),
        model: "access_request",
      },
    });

    if (response.ok) {
      setFeedback({
        message: "Request Sent",
        type: "success",
        dismissable: true,
      });
      requestSent.current = true;
    } else {
      setFeedback({
        type: "error",
        message: data?.error || data.errors[0].detail || "Unknown Error",
      });
    }
  };

  const cancelRequest = async (recordId: number) => {
    const { response } = await request({
      path: `public/v4/admin/access_requests/${recordId}`,
      method: "DELETE",
    });

    if (response.ok) {
      revalidator.revalidate();
      setFeedback({
        type: "success",
        message: "Request has been canceled.",
        dismissable: true,
      });
    } else {
      setFeedback({ type: "error", message: "Unknown Error" });
    }
  };

  if (currentUser?.super) {
    return (
      <>
        <Navbar />
        <div className="mt-24 w-2xl mx-auto text-black/75 flex flex-col space-y-4">
          You are a super user. You have access to everything. Enjoy and be
          careful.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-24 w-11/12 lg:w-3/4 max-w-4xl mx-auto text-black/75 flex flex-col space-y-4">
        <InputWrapper className="flex flex-wrap space-x-3">
          <Label className="block mb-2.5 font-medium text-black/75 text-xl">
            Request Access
          </Label>
          <Description as="p" className="mb-4">
            When you select a site from the list, a request will be sent to the
            site&apos;s admin. You should receive an email if/when your request
            is approved. You can also check the status here.
          </Description>
          <div className="basis-full relative">
            <Select
              value={value}
              onChange={(e) => startRequest(e.target.value)}
              aria-required={false}
              className="appearance-none border bg-blue-100 border-gray-300 border-default-medium w-full text-heading text-base rounded-base focus:ring-brand focus:border-brand block rounded-md px-4 py-3.5 shadow-xs me-0 cursor-pointer"
              // className={
              //   "mt-3 block w-full appearance-none rounded-lg border-default-medium bg-black/5 px-3 py-1.5 text-base text-black/75 focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25 cursor-pointer"
              // }
            >
              <option
                value=""
                disabled
              >{`Select a Site to Request Access`}</option>
              {(filteredTourSets ?? tourSets).map((option) => {
                return (
                  <option key={option.subdir} value={option.subdir}>
                    {option.name}
                  </option>
                );
              })}
            </Select>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="group pointer-events-none absolute top-5 right-3 size-4"
              aria-hidden="true"
            />
          </div>
        </InputWrapper>
        {currentUser && currentUser.access_requests && (
          <div className="text-black/75">
            <h2 className="text-lg font-semibold mb-2.5">Pending requests</h2>
            {currentUser.access_requests.length > 0 ? (
              <table className="text-sm w-full">
                <thead className="font-bold">
                  <tr>
                    <td>Site</td>
                    <td>Tour(s)</td>
                    <td className="text-left">Date</td>
                    <td className="text-center">Cancel</td>
                  </tr>
                </thead>
                <tbody>
                  {currentUser.access_requests.map((request, index) => {
                    return (
                      <tr
                        key={request.id}
                        className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} h-8`}
                      >
                        <td>{request.site}</td>
                        <td className="px-2">
                          {request.tours?.length === 0
                            ? "ALL"
                            : request.tours?.join(", ")}
                        </td>
                        <td className="text-left">{request.date}</td>
                        <td className="text-center">
                          <FormContext.Provider
                            value={{
                              recordId: request.id,
                              handleDelete: cancelRequest,
                            }}
                          >
                            <DeleteButton
                              label={`Cancel request for ${request.site}`}
                              icon={faCircleXmark}
                              className=""
                              iconClassName="text-red-400 hover:text-red-600"
                              removing="Access Request"
                              description={`Cancel Access Request for ${request.site}`}
                              message={`Are you sure you want to cancel your request for access to ${request.site}?`}
                            >
                              {" "}
                            </DeleteButton>
                          </FormContext.Provider>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="w-full text-center">No pending requests.</p>
            )}
          </div>
        )}
      </div>
      <Dialog open={askConfirm} onClose={() => {}} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30"></DialogBackdrop>
        <div className="fixed inset-0 w-screen p-4 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="max-w-xl space-y-4 border bg-white p-8 rounded-md">
              <DialogTitle
                as="h3"
                className="text-base/7 font-medium text-black"
              >
                Confirm Request for Access
              </DialogTitle>
              <form onSubmit={handleSubmit}>
                <AccessRequestForm site={selectedSite} />
                <div className="mt-6 flex gap-4 justify-end">
                  <Button
                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                    onClick={() => {
                      setValue("");
                      setAskConfirm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-blue-600 data-open:bg-blue-700"
                    type="submit"
                  >
                    Got it, send request!
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AccessRequestRoute;
