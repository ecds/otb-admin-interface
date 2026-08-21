import { useNavigate } from "react-router";
import { sendDelete } from "~/utils/requests";
import TourList from "~/components/TourList";
import { useContext, useState } from "react";
import {
  AuthContext,
  FeedbackContext,
  FormContext,
  TourSetContext,
} from "~/contexts";
import { getErrorMessage } from "~/utils/errors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { createTour } from "~/utils/create";
import SiteLogo from "~/components/SiteLogo";
import PendingApproval from "~/components/PendingApproval";
import { Button } from "@headlessui/react";
import ManageSiteAccess from "~/components/ManageSiteAccess";
import TourSetDescription from "~/components/TourSetDescription";
import type { TTour } from "~/types";

const TourSetRoute = () => {
  const { currentUser, currentTenantAdmin } = useContext(AuthContext);
  const { tourSet } = useContext(TourSetContext);
  const [listItems, setListItems] = useState<TTour[]>(tourSet.tours);
  const { setFeedback } = useContext(FeedbackContext);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setFeedback({ type: "success", message: "Creating Tour" });
    const { response, data } = await createTour(tourSet.subdir);
    if (response.ok) {
      navigate(`edit/${data.id}`);
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create the tour."),
      });
    }
  };

  const handleDelete = async (id: number) => {
    const { response, data } = await sendDelete({
      tenant: tourSet.subdir,
      record: id,
      body: {
        model: "tour",
      },
    });
    if (response.ok) {
      setListItems((listItems) => listItems.filter((item) => item.id !== id));
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not delete tour."),
      });
    }
  };

  if (!currentUser) return <></>;

  if (tourSet.tours.length < 1) {
    return (
      <div className="mt-24">
        <div className="flex flex-col text-3xl h-[calc(100vh-8rem)] items-center justify-center uppercase space-y-8">
          <p>Welcome to your new OpenTour Site</p>
          <Button
            className="w-max text-white p-8 uppercase rounded-lg hover:text-black mb-4 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
            onClick={handleCreate}
          >
            Create your first tour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormContext.Provider value={{ handleDelete }}>
      <div className="mt-24">
        <TourList tours={listItems} heading="Tours">
          {(currentUser.super || currentTenantAdmin) && (
            <>
              <SiteLogo tourSet={tourSet} />
              <div className="flex flex-row space-x-4">
                <button
                  className="w-max text-white hover:text-black h-8 px-2 py-1 mb-4 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
                  onClick={handleCreate}
                >
                  <FontAwesomeIcon icon={faPlus} /> New Tour
                </button>
                <PendingApproval />
                <ManageSiteAccess />
              </div>
              <TourSetDescription tourSet={tourSet} />
            </>
          )}
        </TourList>
      </div>
    </FormContext.Provider>
  );
};

export default TourSetRoute;
