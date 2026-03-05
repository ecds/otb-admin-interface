import { faCheck, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from "react-router";
import ToolTip from "./inputs/ToolTip";
import type { ReactNode } from "react";
import type { TTour, TTourSet } from "~/types";
import SelectInput from "./inputs/SelectInput";

interface Props {
  items: TTourSet[] | TTour[];
  handleDelete: () => void;
  heading: string;
  children?: ReactNode;
}

const List = ({ items, handleDelete, heading, children }: Props) => {
  const params = useParams();

  return (
    <table className="w-5/6 p-8 m-auto">
      <caption className="caption-top text-left">{children}</caption>
      <thead className="">
        <tr className="">
          <th className="text-left">{heading ?? "Name"}</th>
          {heading === "Tours" && (
            <th className="flex justify-center">
              Published{" "}
              <ToolTip id="publish_tour">
                Until published, the tour will only be visible when signed in to
                OpenTour.
              </ToolTip>
            </th>
          )}
          <th className="max-w-fit">Delete</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          return (
            <tr
              key={item.id}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} hover:bg-gray-200 py-8 my-8`}
            >
              <td className="p-2">
                {(item as TTourSet).subdir ? (
                  <Link
                    to={`/${(item as TTourSet).subdir}/`}
                    className="hover:underline text-blue-700 hover:text-blue-900"
                  >
                    {(item as TTourSet).name}
                  </Link>
                ) : (
                  <Link
                    to={`/${params.tourSet}/edit/${item.id}`}
                    className="hover:underline text-blue-700 hover:text-blue-900"
                  >
                    {(item as TTour).title}
                  </Link>
                )}
              </td>
              {heading === "Tours" && (
                <td className="text-center">
                  <FontAwesomeIcon
                    icon={(item as TTour).published ? faCheck : faX}
                  />
                </td>
              )}
              <td className="text-center">
                <button onClick={handleDelete}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default List;
