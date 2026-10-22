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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Stop from "./Stop";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { sendCreate } from "~/utils/requests";
import { flushTour } from "~/utils/autosave";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ToolTip from "../inputs/ToolTip";
import Reuse from "../Reuse";
import type { TServerResponse, TStop } from "~/types";
import { getErrorMessage } from "~/utils/errors";

const EMPTY: TStop[] = [];

const StopsList = () => {
  const tour = useTourStore((s) => s.tour);
  const addStop = useTourStore((s) => s.addStop);
  const removeStop = useTourStore((s) => s.removeStop);
  const reorderStops = useTourStore((s) => s.reorderStops);
  const { setFeedback } = useContext(FeedbackContext);
  const [openOtherStops, setOpenReuseStops] = useState<boolean>(false);
  const [pendingOpenSlug, setPendingOpenSlug] = useState<string | undefined>(
    undefined,
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const stops = tour?.stops ?? EMPTY;

  // Runs after React has committed the newly added stop to the DOM, so the
  // element is guaranteed to exist by the time this effect fires.
  useEffect(() => {
    if (!pendingOpenSlug) return;
    const element = document.getElementById(pendingOpenSlug);
    if (element) (element as HTMLDetailsElement).open = true;
    setPendingOpenSlug(undefined);
    setFeedback(undefined);
  }, [pendingOpenSlug, stops, setFeedback]);

  if (!tour) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((stop) => stop.id == active.id);
      const newIndex = stops.findIndex((stop) => stop.id == over.id);
      reorderStops(oldIndex, newIndex);
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

  // Linking goes out right away so the new stop comes back with everything
  // the server fills in.
  const linkStop = async (stop: TStop) => {
    setFeedback({ type: "success", message: "Adding Stop to Tour." });
    addStop({
      ...stop,
      media: stop.media ?? [],
      voice_overs: stop.voice_overs ?? [],
    });
    if (await flushTour()) {
      setPendingOpenSlug(stop.slug);
      return true;
    }
    return false;
  };

  const createJoin = (data: TServerResponse) =>
    linkStop({ ...(data as TStop), media: [] });

  const createStop = async (stopToCopy: TStop | undefined = undefined) => {
    setFeedback({ type: "success", message: "Creating Stop" });

    const { response, data } = await sendCreate({
      tenant: tour.tenant,
      body: {
        model: "stop",
        stop: stopToCopy ?? {
          title: `New Stop ${Date.now()}`,
        },
      },
    });

    if (response.ok) {
      // A copy is linked to the same media as the original.
      await linkStop({ ...(data as TStop), media: stopToCopy?.media ?? [] });
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create stop."),
      });
    }
  };

  if (tour.open_geographies_endpoint) return <></>;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext items={stops} strategy={verticalListSortingStrategy}>
          <div>
            <div className="text-2xl flex space-x-3 my-8">Stops</div>
            <div className="flex flex-row gap-8">
              <div className="flex flex-row items-center gap-2">
                <button
                  className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
                  onClick={() => createStop()}
                >
                  <FontAwesomeIcon icon={faPlus} /> Create New
                </button>{" "}
                <ToolTip>
                  Create a new stop. Each stop MUST have a unique name for your
                  entire Tour Site. Each stop MUST have a location. You can
                  reuse locations.
                </ToolTip>
              </div>
              <div className="flex flex-row items-center gap-2">
                <button
                  className="cursor-pointer h-8 bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 drop-shadow-md"
                  onClick={() => setOpenReuseStops(true)}
                >
                  Reuse Stops
                </button>{" "}
                <ToolTip>Reuse stops from other tours.</ToolTip>
              </div>
            </div>
            {stops.map((stop) => (
              <Stop
                key={stop.id}
                stop={stop}
                onDelete={() => removeStop(stop.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Reuse
        isOpen={openOtherStops}
        setIsOpen={setOpenReuseStops}
        model="stops"
        itemIds={tour.stops.map((stop) => stop.id)}
        copy={createStop}
        add={createJoin}
      />
    </>
  );
};

export default StopsList;
