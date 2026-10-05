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
import { useContext, useState } from "react";
import { sendDelete, sendUpdate } from "~/utils/requests";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import SortableMedium from "./SortableMedium";
import FileDrop from "./FileDrop";
import Embed from "./Embed";
import FileUpload from "../inputs/FileUpload";
import ToolTip from "../inputs/ToolTip";
import ReuseMedia from "../ReuseMedia";
import { getErrorMessage } from "~/utils/errors";
import type { DragEndEvent } from "@dnd-kit/core";
import type { TMedium } from "~/types";

const EMPTY: TMedium[] = [];

interface Props {
  recordModel: "tour" | "stop";
  recordId: number;
}

const MediaGrid = ({ recordModel, recordId }: Props) => {
  const [fileSaving, setFileSaving] = useState<string | undefined>(undefined);
  const [openReuseMedia, setOpenReuseMedia] = useState<boolean>(false);
  const relatedModel = recordModel === "stop" ? "stop_medium" : "tour_medium";
  const join = {
    relatedModel,
    relatedType: "many",
    recordModel,
    recordId,
  } as const;
  const { setFeedback } = useContext(FeedbackContext);
  const tenant = useTourStore((s) => s.tour?.tenant);
  const items = useTourStore((s) =>
    recordModel === "stop"
      ? (s.tour?.stops.find((stop) => stop.id === recordId)?.media ?? EMPTY)
      : (s.tour?.media ?? EMPTY),
  );
  const updateTourField = useTourStore((s) => s.updateTourField);
  const updateStopField = useTourStore((s) => s.updateStopField);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const currentMedia = () => {
    const tour = useTourStore.getState().tour;
    return recordModel === "stop"
      ? (tour?.stops.find((stop) => stop.id === recordId)?.media ?? EMPTY)
      : (tour?.media ?? EMPTY);
  };

  const setMedia = (media: TMedium[]) => {
    if (recordModel === "stop") updateStopField(recordId, "media", media);
    else updateTourField("media", media);
  };

  const savePosition = async (item: TMedium) => {
    if (!tenant) return;
    const { response, data } = await sendUpdate({
      tenant,
      record: item.relation_id,
      body: {
        model: relatedModel,
        [relatedModel]: { position: item.position },
        reindex: {
          model: recordModel,
          id: recordId,
        },
      },
    });
    if (!response.ok) {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not save the new media order."),
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((medium) => medium.id == active.id);
    const newIndex = items.findIndex((medium) => medium.id == over.id);
    const before = new Map(items.map((medium) => [medium.id, medium.position]));
    const reordered = arrayMove(items, oldIndex, newIndex).map(
      (medium, index) => ({ ...medium, position: index + 1 }),
    );
    setMedia(reordered);
    reordered
      .filter((medium) => before.get(medium.id) !== medium.position)
      .forEach(savePosition);
  };

  const handleDelete = async (id: number) => {
    if (!tenant) return;
    const { response, data } = await sendDelete({
      tenant,
      record: id,
      body: {
        model: relatedModel,
        reindex: {
          model: recordModel,
          id: recordId,
        },
      },
    });
    if (response.ok) {
      setMedia(currentMedia().filter((item) => item.relation_id !== id));
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not remove media."),
      });
    }
  };

  const itemAdded = (newItem: unknown) => {
    setMedia([...currentMedia(), newItem as TMedium]);
  };

  return (
    <div>
      <div className="text-2xl flex space-x-3 my-8">Media</div>
      <Embed join={join} onSuccess={itemAdded} />
      <FileDrop
        join={join}
        onSuccess={itemAdded}
        fileSaving={fileSaving}
        setFileSaving={setFileSaving}
      >
        <FileUpload
          join={join}
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
          <ToolTip>Add media from other tours or stops.</ToolTip>
        </div>
        <p className="mt-8">Media Count: {items.length}</p>
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div className="flex flex-row flex-wrap mt-8 space-x-6 space-y-6 justify-center-safe items-start">
            {items.map((medium) => (
              <SortableMedium
                key={medium.id}
                medium={medium}
                onDelete={() => handleDelete(medium.relation_id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <ReuseMedia
        join={join}
        isOpen={openReuseMedia}
        setIsOpen={setOpenReuseMedia}
        onSuccess={itemAdded}
        itemIds={items.map((item) => item.id)}
      />
    </div>
  );
};

export default MediaGrid;
