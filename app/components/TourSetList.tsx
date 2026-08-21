import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import type { ReactNode } from "react";
import type { TTourSet } from "~/types";

interface Props {
  items: TTourSet[];
  heading: string;
  handleDelete?: (id: number) => void;
  children?: ReactNode;
}

const TourSetList = ({ items, heading, handleDelete, children }: Props) => {
  return (
    <div className="w-11/12 lg:w-3/4 max-w-7xl m-auto">
      {children}
      <table className="w-full p-8">
        <thead>
          <tr>
            <th className="text-left">{heading}</th>
            {handleDelete && <th className="max-w-fit">Delete</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((tourSet, index) => (
            <tr
              key={tourSet.subdir}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} hover:bg-gray-200 py-8 my-8`}
            >
              <td className="p-2">
                <Link
                  to={`/${tourSet.subdir}/`}
                  className="hover:underline text-blue-700 hover:text-blue-900"
                >
                  {tourSet.name}
                </Link>
              </td>
              {handleDelete && (
                <td className="text-center">
                  <button onClick={() => handleDelete(tourSet.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TourSetList;
