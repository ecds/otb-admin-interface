import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useContext, useEffect, useState } from "react";
import { sendDelete, sendUpdate } from "~/utils/requests";
import { FormContext, RecordContext } from "~/contexts";
import { useNavigate } from "react-router";
import SortableMedium from "./SortableMedium";
import FileDrop from "./FileDrop";
import type { DragEndEvent } from "@dnd-kit/core";
import type { TMedium } from "~/types";

const MediaGrid = ({ media, model }: { media: TMedium[]; model: string }) => {
  const [items, setItems] = useState(media);
  const { tenant, recordId, recordModel } = useContext(RecordContext);
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const sendRequest = async (newPosition: number, item: TMedium) => {
      const { response } = await sendUpdate({
        tenant,
        record: item.relation_id,
        body: {
          attribute: "position",
          model,
          value: newPosition,
          reindex: {
            model: recordModel,
            id: recordId,
          },
        },
      });

      if (response.ok) navigate(".", { replace: true });
    };

    items.forEach((item, index) => {
      const newPosition = index + 1;
      if (newPosition !== item.position) {
        item.position = newPosition;
        sendRequest(newPosition, item);
      }
    });
  }, [items, tenant, model, recordId, recordModel, navigate]);

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

  const handleDelete = async (id: number) => {
    const { response } = await sendDelete({
      tenant,
      record: id,
      model: "tour_medium",
    });
    if (response.ok)
      setItems((items) => items.filter((item) => item.relation_id !== id));
  };

  const itemAdded = (newItem: TMedium) => {
    setItems((items) => [...items, newItem]);
  };

  return (
    <div>
      <div className="text-2xl flex space-x-3 my-8">Media</div>
      <FileDrop onSuccess={itemAdded} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="flex flex-row flex-wrap mt-8 space-x-6 space-y-6 justify-center-safe items-start">
            {items.map((medium) => (
              <FormContext
                key={medium.id}
                value={{
                  handleDelete,
                  recordId: medium.relation_id,
                }}
              >
                <SortableMedium medium={medium} />
              </FormContext>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default MediaGrid;
