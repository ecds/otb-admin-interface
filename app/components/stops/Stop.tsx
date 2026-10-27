import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TextInput from "../inputs/TextInput";
import StopMap from "../map/StopMap";
import { useRef, useState } from "react";
import MediaGrid from "../media_grid/MediaGrid";
import DeleteButton from "../buttons/DeleteButton";
import VoiceOverUpload from "../voice_overs/VoiceOverUpload";
import VoiceOverList from "../voice_overs/VoiceOverList";
import { useRemovalBlocked } from "~/utils/tourAccess";
import type { TStop } from "~/types";

const Stop = ({ stop, onDelete }: { stop: TStop; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stop.id });

  const removalBlocked = useRemovalBlocked("stop", stop.id);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  // Each map holds a WebGL context and browsers only keep about 16, so a
  // stop's map only exists while the stop is open.
  const [open, setOpen] = useState(false);

  const scrollToStop = () => {
    if (!detailsRef.current) return;
    setOpen(detailsRef.current.open);
    if (detailsRef.current.open) detailsRef.current.scrollIntoView();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex w-full items-center justify-between font-semibold text-lg bg-gray-200 my-8 p-3 rounded-md ">
        <details
          ref={detailsRef}
          onToggle={scrollToStop}
          name="stops"
          id={stop.slug}
          className="grow"
          style={{ scrollMarginTop: "5rem" }}
        >
          <summary className="group grow cursor-pointer">
            <div>
              {stop.position}: {stop.title}
            </div>
          </summary>
          <div className="bg-white mt-4 p-4 mx-auto w-full text-black/75">
            <TextInput
              itemId={stop.id}
              valueType="text"
              value={stop.title}
              id="title"
              label="Title"
              type="text"
              model="stop"
            />
            <TextInput
              itemId={stop.id}
              type="rich-text"
              value={stop.description}
              id="description"
              label="Description"
              model="stop"
            />
            <TextInput
              itemId={stop.id}
              type="text-area"
              value={stop.meta_description}
              id="meta_description"
              label="Meta Description"
              model="stop"
            />
            <VoiceOverUpload stop_id={stop.id} />
            <VoiceOverList stopId={stop.id} />

            {open && <StopMap stop={stop} />}
            <TextInput
              itemId={stop.id}
              type="rich-text"
              value={stop.direction_notes ?? ""}
              id="direction_notes"
              label={"Directions"}
              model="stop"
            />
            <MediaGrid recordModel="stop" recordId={stop.id} />
            {removalBlocked ? (
              <p className="text-sm text-black/70">{removalBlocked}</p>
            ) : (
              <DeleteButton removing="Stop for the tour" onDelete={onDelete} />
            )}
          </div>
        </details>
        <FontAwesomeIcon
          {...listeners}
          icon={faBars}
          className="cursor-grab active:cursor-grabbing"
        />
      </div>
    </div>
  );
};

export default Stop;
