import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  onClick: Dispatch<SetStateAction<boolean>>;
}

const EditButton = ({ onClick }: Props) => {
  return (
    <button
      className="cursor-pointer bg-blue-300 hover:bg-blue-500 h-8 text-black/75 hover:text-white/75 px-2 rounded-sm drop-shadow-lg"
      onClick={() => onClick(true)}
    >
      <FontAwesomeIcon icon={faPencil} /> Edit
    </button>
  );
};

export default EditButton;
