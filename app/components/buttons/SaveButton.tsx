import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { useRevalidator } from "react-router";
import { TourContext } from "~/contexts";

const SaveButton = () => {
  const { lastUpdated, isSaving, setIsSaving } = useContext(TourContext);
  const revalidator = useRevalidator();

  const handleClick = () => {
    setIsSaving(true);
    revalidator.revalidate();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg capitalize"
      >
        Save
      </button>
      <div className="my-auto">
        {isSaving ? (
          <>
            Saving
            <FontAwesomeIcon icon={faSpinner} spin={true} />
          </>
        ) : (
          <>
            <span className="font-semibold">Last Saved:</span> {lastUpdated}
          </>
        )}
      </div>
    </>
  );
};

export default SaveButton;
