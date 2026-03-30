import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import { request } from "~/utils/requests";
import List from "~/components/List";
import { useContext } from "react";
import { AuthContext, FeedbackContext, TourSetContext } from "~/contexts";
import type { TAccessRequest, TServerError, TTour } from "~/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { createTour } from "~/utils/create";
import SiteLogo from "~/components/SiteLogo";
import PendingApproval from "~/components/PendingApproval";
import { Button } from "@headlessui/react";
import ManageSiteAccess from "~/components/ManageSiteAccess";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: accessRequests } = await request({
    path: `${params.tourSet}/v4/admin/access_requests`,
  });

  return { accessRequests };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { accessRequests } = useLoaderData<{
    tours: TTour[];
    accessRequests: TAccessRequest[];
  }>();
  const { currentUser, currentTenantAdmin } = useContext(AuthContext);
  const tourSet = useContext(TourSetContext);
  const { setFeedback } = useContext(FeedbackContext);
  const navigate = useNavigate();

  const handleCreate = async () => {
    setFeedback({ type: "success", message: "Creating Tour" });
    const { response, data } = await createTour(tourSet.subdir);
    if (response.ok) {
      navigate(`edit/${data.id}`);
      setFeedback(undefined);
    }
    if (!response.ok)
      setFeedback({
        type: "error",
        message: data.errors.map((e: TServerError) => e.detail),
      });
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
    <div className="mt-24">
      <List items={tourSet.tours} handleDelete={() => {}} heading="Tours">
        <SiteLogo tourSet={tourSet} />
        {(currentUser.super || currentTenantAdmin) && (
          <div className="flex flex-row space-x-4">
            <button
              className="w-max text-white hover:text-black h-8 px-2 py-1 mb-4 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
              onClick={handleCreate}
            >
              <FontAwesomeIcon icon={faPlus} /> New Tour
            </button>
            <PendingApproval accessRequests={accessRequests} />
            <ManageSiteAccess />
          </div>
        )}
      </List>
    </div>
  );
};

export default TourSetRoute;
