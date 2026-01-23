import { useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TStop } from "~/types";
import Stop from "./Stop";

const StopsList = ({ stops }: { stops: TStop[] }) => {
  const [items, setItems] = useState(stops);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div>
          <div className="text-2xl flex space-x-3 my-8">Stops</div>
          {items.map((stop) => (
            <Stop key={stop.id} stop={stop} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((stop) => stop.id == active.id)
        );
        const newIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((stop) => stop.id == over.id)
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
};

export default StopsList;
