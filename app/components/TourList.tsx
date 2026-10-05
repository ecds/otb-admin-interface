import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from "react-router";
import ToolTip from "./inputs/ToolTip";

import DeleteButton from "./buttons/DeleteButton";
import type { ReactNode } from "react";
import type { TTour } from "~/types";

interface Props {
  tours: TTour[];
  heading: string;
  tenant?: string;
  children?: ReactNode;
  onDelete?: (tourId: number) => void;
}

const TourList = ({ tours, heading, tenant, children, onDelete }: Props) => {
  const params = useParams();

  return (
    <div className="w-11/12 lg:w-3/4 max-w-7xl m-auto">
      {children}
      <table className="w-full p-8">
        <thead>
          <tr>
            <th className="text-left">{heading}</th>
            <th className="flex justify-center">
              Published{" "}
              <ToolTip>
                Until published, the tour will only be visible when signed in to
                OpenTour.
              </ToolTip>
            </th>
            {onDelete && <th className="max-w-fit">Delete</th>}
          </tr>
        </thead>
        <tbody>
          {tours.map((tour, index) => (
            <tr
              key={tour.id}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} hover:bg-gray-200 py-8 my-8`}
            >
              <td className="p-2">
                <Link
                  to={`/${tenant ?? params.tourSet}/edit/${tour.id}`}
                  className="hover:underline text-blue-700 hover:text-blue-900"
                >
                  {tour.title}
                </Link>
              </td>
              <td className="text-center">
                <span title={tour.published_on}>
                  {tour.published_on ? (
                    <>{tour.published_on}</>
                  ) : (
                    <FontAwesomeIcon icon={tour.published ? faCheck : faX} />
                  )}
                </span>
              </td>
              {onDelete && (
                <td className="text-center">
                  <DeleteButton
                    removing={tour.title}
                    onDelete={() => onDelete(tour.id)}
                    label=""
                    className=""
                  >
                    <></>
                  </DeleteButton>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TourList;
