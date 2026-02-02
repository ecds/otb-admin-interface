import { useContext, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TStop } from "~/types";
import Stop from "./Stop";
import { RecordContext, RelatedContext } from "~/contexts";
import { sendUpdate } from "~/utils/requests";

const StopsList = () => {
  const { relatedModel } = useContext(RelatedContext);
  const { tour } = useContext(RecordContext);
  const [items, setItems] = useState<TStop[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (tour) setItems(tour.stops);
  }, [tour]);

  useEffect(() => {
    const sendRequest = async (newPosition: number, item: TStop) => {
      if (!tour) return;
      await sendUpdate({
        tenant: tour.tenant,
        record: item.relation_id,
        body: {
          attribute: "position",
          model: relatedModel,
          value: newPosition,
          reindex: {
            model: "tour",
            id: tour.id,
          },
        },
      });
    };

    items.forEach((item, index) => {
      const newPosition = index + 1;
      if (newPosition !== item.position) {
        item.position = newPosition;
        sendRequest(newPosition, item);
      }
    });
  }, [tour, relatedModel, items]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    event.activatorEvent.preventDefault();
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((stop) => stop.id == active.id),
        );
        const newIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((stop) => stop.id == over.id),
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    document
      .getElementsByName("stops")
      .forEach((stop) => ((stop as HTMLDetailsElement).open = false));
  };

  const handleDragStart = (event: DragStartEvent) => {
    document
      .getElementsByName("stops")
      .forEach((stop) => ((stop as HTMLDetailsElement).open = false));
    event.activatorEvent.preventDefault();
    const panel = (event.activatorEvent.target as HTMLElement)?.closest(
      "details",
    );
    if (panel) {
      panel.open = false;
    }
  };

  if (tour) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div>
            <div className="text-2xl flex space-x-3 my-8">Stops</div>
            {tour.stops.map((stop) => (
              <Stop key={stop.id} stop={stop} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return <></>;
};

export default StopsList;
