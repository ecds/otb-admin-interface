import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import type { TMedium } from "~/types";

const SortableItem = ({ medium }: { medium: TMedium }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: medium.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className="w-64 h-80 border border-black/45 bg-white rounded-md drop-shadow-lg"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="grid grid-cols-1 h-80">
        <figure>
          <img
            className="max-h-64 mx-auto p-1"
            src={medium.files.mobile}
            alt=""
          />
          <figcaption>{medium.title ?? "no caption"}</figcaption>
        </figure>
        <div className="flex space-x-2 justify-around">
          <button>edit</button>
          <button>delete</button>
        </div>
      </div>
    </div>
  );
};

const MediaGrid = ({ media }: { media: TMedium[] }) => {
  const [items, setItems] = useState(media);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((medium) => medium.id == active.id)
        );
        const newIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((medium) => medium.id == over.id)
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="text-2xl flex space-x-3 my-8">Media</div>
        <div className="flex flex-row flex-wrap space-x-6 space-y-6 justify-center-safe items-start">
          {items.map((medium) => (
            <SortableItem key={medium.id} medium={medium} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default MediaGrid;
