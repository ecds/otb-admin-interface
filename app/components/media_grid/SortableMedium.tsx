import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TMedium } from "~/types";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";

interface Props {
  medium: TMedium;
}

const SortableMedium = ({ medium }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: medium.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="w-64 bg-gray-100"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="block max-w-sm border border-black/75 border-default rounded-md shadow-xs">
        <div {...listeners} className="bg-white">
          <img
            className="rounded-base drop-shadow-md mx-auto"
            src={medium.files.mobile}
            alt=""
          />
        </div>
        <div className="py-6 px-2 text-base overflow-hidden tracking-tight text-heading text-black/75 truncate">
          {medium.position}: {medium.title ?? medium.filename}
        </div>
        <div className="mb-6 flex space-x-2 justify-around items-end text-sm">
          <EditButton />
          <DeleteButton />
        </div>
      </div>
    </div>
  );
};

export default SortableMedium;
