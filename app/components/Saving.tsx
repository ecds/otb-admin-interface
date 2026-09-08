import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export const Saving = () => {
  return (
    <p className="basis-full py-3.5 px-4 text-lg bg-green-300/50 rounded-md">
      Saving <FontAwesomeIcon icon={faSpinner} spin />
    </p>
  );
};

export const Deleting = () => {
  return (
    <p className="basis-full py-3.5 px-4 text-lg bg-red-300/50 rounded-md">
      Deleting <FontAwesomeIcon icon={faSpinner} spin />
    </p>
  );
};
