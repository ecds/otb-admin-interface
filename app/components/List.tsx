import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from "react-router";
import type { TTour, TTourSet } from "~/types";

interface Props {
  items: TTourSet[] | TTour[];
  handleDelete: () => void;
  heading: string;
}

const List = ({ items, handleDelete, heading }: Props) => {
  const params = useParams();

  return (
    <div className="relative md:my-24 mx-8 flex flex-col overflow-x-auto">
      <div className="flex flex-row-reverse px-6 text-xl mb-2">
        <div>Delete</div>
        <div className="justify-self-start grow">{heading ?? "Name"}</div>
      </div>
      {items.map((item, index) => {
        return (
          <div
            key={item.id}
            className={`flex flex-row-reverse px-6 items-center ${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} hover:bg-gray-200`}
          >
            <button className="my-2 w-12" onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} />
            </button>
            <div className="justify-self-start grow">
              {item.subdir ? (
                <Link
                  to={`/admin/${item.subdir}/`}
                  className="hover:underline text-blue-700 hover:text-blue-900"
                >
                  {item.name}
                </Link>
              ) : (
                <Link
                  to={`/admin/${params.tourSet}/edit/${item.id}`}
                  className="hover:underline text-blue-700 hover:text-blue-900"
                >
                  {item.title}
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default List;
