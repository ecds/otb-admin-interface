import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import { request } from "~/utils/requests";
import List from "~/components/List";
import { useContext } from "react";
import { AuthContext, FeedbackContext, TourSetContext } from "~/contexts";
import type { TServerError, TTour } from "~/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { createTour } from "~/utils/create";
import SiteLogo from "~/components/SiteLogo";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: tours } = await request({
    path: `${params.tourSet}/v4/admin/tours`,
  });
  return { tours: tours };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tours } = useLoaderData<{
    tours: TTour[];
  }>();
  const { currentUser } = useContext(AuthContext);
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

  return (
    <div className="mt-24">
      <List items={tours} handleDelete={() => {}} heading="Tours">
        {(currentUser.super || currentUser.current_tenant_admin) && (
          <>
            <SiteLogo tourSet={tourSet} />
            <button
              className="w-max text-white hover:text-black h-8 px-2 py-1 mb-4 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
              onClick={handleCreate}
            >
              <FontAwesomeIcon icon={faPlus} /> New Tour
            </button>
          </>
        )}
      </List>
    </div>
  );
};

export default TourSetRoute;
