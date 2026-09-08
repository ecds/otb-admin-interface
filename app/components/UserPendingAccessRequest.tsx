import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@headlessui/react";
import { useCallback, useContext, useState } from "react";
import { useRevalidator } from "react-router";
import { FeedbackContext, TourSetContext } from "~/contexts";
import { sendUpdate } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";
import type { TAccessRequest } from "~/types";

interface Props {
  request: TAccessRequest;
  index: number;
}

const UserPendingAccessRequest = ({ request, index }: Props) => {
  const { tourSet } = useContext(TourSetContext);
  const [selectedTour, setSelectedTour] = useState<string>("");
  const { setFeedback } = useContext(FeedbackContext);
  const revalidator = useRevalidator();

  const updateApproval = useCallback(
    async (approved: boolean, record: number) => {
      const { data, response } = await sendUpdate({
        path: `${tourSet.subdir}/v4/admin/access_requests/${record}`,
        tenant: tourSet.subdir,
        record,
        body: {
          model: "access_request",
          access_request: {
            approved,
            tour_ids: request.tour_ids,
          },
        },
      });

      if (response.ok) {
        setTimeout(() => {
          revalidator.revalidate();
        }, 1000);
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(
            data,
            "Could not update this access request.",
          ),
        });
      }
    },
    [setFeedback, revalidator, tourSet, selectedTour],
  );

  return (
    <tr
      key={request.id}
      className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} py-8 my-8`}
    >
      <td className="py-2">{request.user}</td>
      <td className="">{request.email}</td>
      <td>
        {request.tours && request.tours.length > 0 ? (
          <>{request.tours.join(", ")}</>
        ) : (
          <select
            className={"w-min border-2 border-black/50 rounded-md bg-white"}
            value={selectedTour}
            onChange={(e) => setSelectedTour(e.target.value)}
          >
            <option
              value=""
              disabled
            >{`Select tour to limit access...`}</option>
            <>
              {tourSet.tours.map((tour) => {
                return (
                  <option key={tour.id} value={tour.id}>
                    {tour.title}
                  </option>
                );
              })}
            </>
          </select>
        )}
      </td>
      <td className="text-center">
        <Button
          aria-label="Deny access request"
          className={"text-red-400"}
          onClick={() => updateApproval(false, request.id)}
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </Button>
      </td>
      <td className="text-center">
        <Button
          aria-label="Approve access request"
          className={"text-green-600"}
          onClick={() => updateApproval(true, request.id)}
        >
          <FontAwesomeIcon icon={faCircleCheck} />
        </Button>
      </td>
    </tr>
  );
};

export default UserPendingAccessRequest;
