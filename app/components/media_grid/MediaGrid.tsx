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
import {
  FeedbackContext,
  FormContext,
  RecordContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import SortableMedium from "./SortableMedium";
import FileDrop from "./FileDrop";
import Embed from "./Embed";
import FileUpload from "../inputs/FileUpload";
import ToolTip from "../inputs/ToolTip";
import ReuseMedia from "../ReuseMedia";
import type { DragEndEvent } from "@dnd-kit/core";
import type { TMedium } from "~/types";

const MediaGrid = ({ media }: { media: TMedium[] }) => {
  const [items, setItems] = useState(media);
  const [fileSaving, setFileSaving] = useState<string | undefined>(undefined);
  const [openReuseMedia, setOpenReuseMedia] = useState<boolean>(false);
  const { recordId, recordModel } = useContext(RecordContext);
  const { tour, setIsSaving } = useContext(TourContext);
  const { relatedModel } = useContext(RelatedContext);
  const { setFeedback } = useContext(FeedbackContext);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setItems(media);
  }, [media]);

  useEffect(() => {
    const sendRequest = async (newPosition: number, item: TMedium) => {
      setIsSaving(true);
      setFeedback({ type: "success", message: "Saving New Order" });
      const { response } = await sendUpdate({
        tenant: tour.tenant,
        record: item.relation_id,
        body: {
          model: relatedModel,
          [relatedModel]: { position: newPosition },
          reindex: {
            model: recordModel,
            id: recordId,
          },
        },
      });
      if (response.ok) {
        setIsSaving(false);
        setFeedback(undefined);
      }
    };

    items.forEach((item, index) => {
      const newPosition = index + 1;
      if (newPosition !== item.position) {
        item.position = newPosition;
        sendRequest(newPosition, item);
      }
    });
  }, [
    items,
    tour,
    relatedModel,
    recordId,
    recordModel,
    setIsSaving,
    setFeedback,
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((medium) => medium.id == active.id),
        );
        const newIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((medium) => medium.id == over.id),
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = async (id: number) => {
    const { response } = await sendDelete({
      tenant: tour.tenant,
      record: id,
      body: {
        model: relatedModel,
        reindex: {
          model: recordModel,
          id: recordId,
        },
      },
    });
    if (response.ok)
      setItems((items) => items.filter((item) => item.relation_id !== id));
  };

  const itemAdded = (newItem: unknown) => {
    setItems((items) => [...items, newItem as TMedium]);
  };

  const itemUpdated = (updatedItem: unknown) => {
    items.splice(
      (updatedItem as TMedium).position - 1,
      1,
      updatedItem as TMedium,
    );
    setItems((items) => items);
    setFeedback(undefined);
  };

  return (
    <div>
      <div className="text-2xl flex space-x-3 my-8">Media</div>
      <Embed onSuccess={itemAdded} />
      <FileDrop
        onSuccess={itemAdded}
        fileSaving={fileSaving}
        setFileSaving={setFileSaving}
      >
        <FileUpload
          onSuccess={itemAdded}
          fileUploading={setFileSaving}
          btnText="Upload Images"
        />
      </FileDrop>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-row gap-4 mt-8 items-center">
          <button
            className="cursor-pointer bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 drop-shadow-md"
            onClick={() => setOpenReuseMedia(true)}
          >
            Reuse Media
          </button>
          <ToolTip id="add-other-media">
            Add media from other tours or stops.
          </ToolTip>
        </div>
        <p className="mt-8">Media Count: {items.length}</p>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="flex flex-row flex-wrap mt-8 space-x-6 space-y-6 justify-center-safe items-start">
            {items.map((medium) => (
              <FormContext.Provider
                key={medium.id}
                value={{
                  handleDelete,
                  recordId: medium.relation_id,
                }}
              >
                <SortableMedium medium={medium} onUpdate={itemUpdated} />
              </FormContext.Provider>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <ReuseMedia
        isOpen={openReuseMedia}
        setIsOpen={setOpenReuseMedia}
        onSuccess={itemAdded}
        itemIds={items.map((item) => item.id)}
      />
    </div>
  );
};

export default MediaGrid;
