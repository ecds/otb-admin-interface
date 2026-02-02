import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RecordContext, RelatedContext } from "~/contexts";
import TextInput from "../inputs/TextInput";
import StopMap from "../map/StopMap";
import { useContext, useRef } from "react";
import type { TStop } from "~/types";
import MediaGrid from "../media_grid/MediaGrid";

const Stop = ({ stop }: { stop: TStop }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stop.id });

  const detailsRef = useRef<HTMLDetailsElement>(null);

  const scrollToStop = () => {
    if (!detailsRef.current) return;
    if (detailsRef.current.open) detailsRef.current.scrollIntoView();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { tour } = useContext(RecordContext);

  return (
    <div
      // className={"border"}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
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
            <RecordContext.Provider
              value={{
                tour,
                recordId: stop.id,
                recordModel: "stop",
                tenant: "ecds",
              }}
            >
              <TextInput
                valueType="text"
                value={stop.title}
                id="title"
                label="Title"
                type="text"
                model="stop"
              />
              <TextInput
                type="rich-text"
                value={stop.description}
                id="description"
                label="Description"
                model="stop"
              />
              <TextInput
                type="text-area"
                value={stop.meta_description}
                id="meta_description"
                label="Meta Description"
                model="stop"
              />
              <StopMap stop={stop} />
              <TextInput
                type="rich-text"
                value={stop.direction_notes ?? ""}
                id="direction_notes"
                label={"Directions"}
                model="stop"
              />
              <RelatedContext.Provider
                value={{ relatedModel: "stop_medium", relatedType: "many" }}
              >
                <MediaGrid media={stop.media} />
              </RelatedContext.Provider>
            </RecordContext.Provider>
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
