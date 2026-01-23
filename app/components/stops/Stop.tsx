import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TStop } from "~/types";

const Stop = ({ stop }: { stop: TStop }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      // className={"border"}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="w-full font-semibold text-lg bg-gray-200 m-8 p-3 rounded-md">
        {stop.position}: {stop.title}
      </div>
    </div>
  );
};

export default Stop;
