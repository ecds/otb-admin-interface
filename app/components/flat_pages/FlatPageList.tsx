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
import {
  FeedbackContext,
  FormContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import { sendCreate, sendDelete, sendUpdate } from "~/utils/requests";
import FlatPage from "./FlatPage";
import ToolTip from "../inputs/ToolTip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { TFlatPage, TServerResponse } from "~/types";
import Reuse from "../Reuse";
import { getErrorMessage } from "~/utils/errors";

const FlatPageList = () => {
  const { relatedModel } = useContext(RelatedContext);
  const { tour } = useContext(TourContext);
  const { setFeedback } = useContext(FeedbackContext);
  const [items, setItems] = useState<TFlatPage[]>([]);
  const [openReuseFlatPages, setOpenReuseFlatPages] = useState<boolean>(false);
  const [pendingOpenSlug, setPendingOpenSlug] = useState<string | undefined>(
    undefined,
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    setItems(tour.flat_pages);
  }, [tour]);

  // Runs after React has committed the newly added page to the DOM, so the
  // element is guaranteed to exist by the time this effect fires.
  useEffect(() => {
    if (!pendingOpenSlug) return;
    const element = document.getElementById(pendingOpenSlug);
    if (element) (element as HTMLDetailsElement).open = true;
    setPendingOpenSlug(undefined);
    setFeedback(undefined);
  }, [pendingOpenSlug, items, setFeedback]);

  useEffect(() => {
    const sendRequest = async (newPosition: number, item: TFlatPage) => {
      const { response, data } = await sendUpdate({
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

      if (!response.ok) {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not save the new page order."),
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
    event.activatorEvent.preventDefault();
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((flatPage) => flatPage.id == active.id),
        );
        const newIndex = items.indexOf(
          // @ts-expect-error: We know it will be there.
          items.find((flatPage) => flatPage.id == over.id),
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    document
      .getElementsByName("flat_pages")
      .forEach((flatPage) => ((flatPage as HTMLDetailsElement).open = false));
  };

  const handleDragStart = (event: DragStartEvent) => {
    document
      .getElementsByName("flat_pages")
      .forEach((flatPage) => ((flatPage as HTMLDetailsElement).open = false));
    event.activatorEvent.preventDefault();
    const panel = (event.activatorEvent.target as HTMLElement)?.closest(
      "details",
    );
    if (panel) {
      panel.open = false;
    }
  };

  const createJoin = async (data: TServerResponse) => {
    setFeedback({ type: "success", message: "Adding Page to Tour." });

    const { response: joinResponse, data: joinData } = await sendCreate({
      tenant: tour.tenant,
      body: {
        model: "tour_flat_page",
        tour_flat_page: {
          tour_id: tour.id,
          flat_page_id: data.id,
          position: items.length + 1,
        },
        reindex: {
          model: "tour",
          id: tour.id,
        },
      },
    });

    if (joinResponse.ok) {
      setItems((items) => [...items, joinData as TFlatPage]);
      setPendingOpenSlug((data as TFlatPage).slug);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(joinData, "Could not add page to tour."),
      });
    }
  };

  const createFlatPage = async (
    flatPageToCopy: TFlatPage | undefined = undefined,
  ) => {
    setFeedback({ type: "success", message: "Creating Page." });

    const { response, data } = await sendCreate({
      tenant: tour.tenant,
      body: {
        model: "flat_page",
        flat_page: flatPageToCopy ?? {
          title: `New Page ${Date.now()}`,
        },
      },
    });

    if (response.ok) {
      createJoin(data);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create page."),
      });
    }
  };

  const handleDelete = async (id: number) => {
    setFeedback({ message: "Removing Page...", type: "success" });
    const { response, data, status } = await sendDelete({
      tenant: tour.tenant,
      record: id,
      body: {
        model: "tour_flat_page",
        reindex: {
          id: tour.id,
          model: "tour",
        },
      },
    });

    if (response.ok || status === 404) {
      setItems((items) => items.filter((item) => item.relation_id === id));
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not remove page."),
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
            <div className="text-2xl flex space-x-3 my-8">Pages</div>
            <div className="flex flex-row gap-8">
              <div className="flex flex-row items-center gap-2">
                <button
                  className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
                  onClick={() => createFlatPage()}
                >
                  <FontAwesomeIcon icon={faPlus} /> Create New
                </button>{" "}
                <ToolTip>
                  Create a new page. You can add an About page to describe the
                  project, copyright information, or other data or images using
                  html and the wysiwyg editor. The pages will show up in the
                  menu.
                </ToolTip>
              </div>
              <div className="flex flex-row items-center gap-2">
                <button
                  className="cursor-pointer h-8 bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 drop-shadow-md"
                  onClick={() => setOpenReuseFlatPages(true)}
                >
                  Reuse Pages
                </button>{" "}
                <ToolTip>Reuse pages from other tours.</ToolTip>
              </div>
            </div>
            {items.map((flatPage) => (
              <FormContext.Provider
                key={flatPage.id}
                value={{ recordId: flatPage.relation_id, handleDelete }}
              >
                <FlatPage flatPage={flatPage} />
              </FormContext.Provider>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Reuse
        model="flat_pages"
        itemIds={tour.flat_pages.map((fp) => fp.id)}
        isOpen={openReuseFlatPages}
        setIsOpen={setOpenReuseFlatPages}
        copy={createFlatPage}
        add={createJoin}
      />
    </>
  );
};

export default FlatPageList;
