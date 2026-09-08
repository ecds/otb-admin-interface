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
import Stop from "./Stop";
import {
  FeedbackContext,
  FormContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import { sendCreate, sendDelete, sendUpdate } from "~/utils/requests";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ToolTip from "../inputs/ToolTip";
import Reuse from "../Reuse";
import type { TServerResponse, TStop } from "~/types";
import { joinImage } from "~/utils/image_upload";
import { getErrorMessage } from "~/utils/errors";
import { useRevalidator } from "react-router";

const StopsList = () => {
  const { relatedModel } = useContext(RelatedContext);
  const { tour } = useContext(TourContext);
  const { setFeedback } = useContext(FeedbackContext);
  const [openOtherStops, setOpenReuseStops] = useState<boolean>(false);
  const [items, setItems] = useState<TStop[]>([]);
  const [pendingOpenSlug, setPendingOpenSlug] = useState<string | undefined>(
    undefined,
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const revalidator = useRevalidator();

  useEffect(() => {
    setItems(tour.stops);
  }, [tour]);

  // Runs after React has committed the newly added stop to the DOM, so the
  // element is guaranteed to exist by the time this effect fires.
  useEffect(() => {
    if (!pendingOpenSlug) return;
    const element = document.getElementById(pendingOpenSlug);
    if (element) (element as HTMLDetailsElement).open = true;
    setPendingOpenSlug(undefined);
    setFeedback(undefined);
  }, [pendingOpenSlug, items, setFeedback]);

  useEffect(() => {
    const sendRequest = async (newPosition: number, item: TStop) => {
      const { response, data } = await sendUpdate({
        tenant: tour.tenant,
        record: item.relation_id,
        body: {
          [relatedModel]: { position: newPosition },
          model: relatedModel,
          reindex: {
            model: "tour",
            id: tour.id,
          },
        },
      });

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not save the new stop order."),
        });
      }
    };

    items.forEach((item, index) => {
      const newPosition = index + 1;
      if (newPosition !== item.position) {
        item.position = newPosition;
        sendRequest(newPosition, item);
      }
    });
  }, [tour, relatedModel, items, setFeedback]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
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

  const createJoin = async (data: TServerResponse) => {
    setFeedback({ type: "success", message: "Adding Stop to Tour." });

    const { response: joinResponse, data: joinData } = await sendCreate({
      tenant: tour.tenant,
      body: {
        model: "tour_stop",
        tour_stop: {
          tour_id: tour.id,
          stop_id: data.id,
          position: items.length + 1,
        },
        reindex: {
          model: "tour",
          id: tour.id,
        },
      },
    });

    if (joinResponse.ok) {
      setItems((items) => [...items, joinData as TStop]);
      setPendingOpenSlug((data as TStop).slug);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(joinData, "Could not add stop to tour."),
      });
    }
  };

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
      await createJoin(data);
      if (stopToCopy) {
        const failedMedia: string[] = [];
        for (const medium of (stopToCopy as TStop).media) {
          setFeedback({ type: "success", message: "Copying media." });
          const { response: joinResponse, data: joinData } = await joinImage({
            relatedType: "many",
            recordModel: "stop",
            relatedModel: "stop_medium",
            recordId: data.id,
            imageId: medium.id,
            tenant: tour.tenant,
          });
          if (!joinResponse.ok) {
            failedMedia.push(
              getErrorMessage(joinData, `Could not copy "${medium.title}".`),
            );
          }
        }
        revalidator.revalidate();
        setFeedback(
          failedMedia.length > 0
            ? { type: "error", message: failedMedia.join(" ") }
            : undefined,
        );
      }
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create stop."),
      });
    }
  };

  const deleteStop = async (id: number) => {
    setFeedback({ message: "Removing Stop from Tour...", type: "success" });
    const { response, data, status } = await sendDelete({
      tenant: tour.tenant,
      record: id,
      body: {
        model: "tour_stop",
        reindex: {
          id: tour.id,
          model: "tour",
        },
      },
    });

    if (response.ok || status === 404) {
      setItems((items) => items.filter((item) => item.relation_id !== id));
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not remove stop."),
      });
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
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
            {items.map((stop) => (
              <FormContext.Provider
                key={stop.id}
                value={{
                  recordId: stop.relation_id,
                  handleDelete: deleteStop,
                }}
              >
                <Stop stop={stop} />
              </FormContext.Provider>
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
