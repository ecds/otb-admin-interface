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
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { sendCreate } from "~/utils/requests";
import { flushTour } from "~/utils/autosave";
import FlatPage from "./FlatPage";
import ToolTip from "../inputs/ToolTip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { TFlatPage, TServerResponse } from "~/types";
import Reuse from "../Reuse";
import { getErrorMessage } from "~/utils/errors";

const EMPTY: TFlatPage[] = [];

const FlatPageList = () => {
  const tour = useTourStore((s) => s.tour);
  const addFlatPage = useTourStore((s) => s.addFlatPage);
  const removeFlatPage = useTourStore((s) => s.removeFlatPage);
  const reorderFlatPages = useTourStore((s) => s.reorderFlatPages);
  const { setFeedback } = useContext(FeedbackContext);
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

  const flatPages = tour?.flat_pages ?? EMPTY;

  // Runs after React has committed the newly added page to the DOM, so the
  // element is guaranteed to exist by the time this effect fires.
  useEffect(() => {
    if (!pendingOpenSlug) return;
    const element = document.getElementById(pendingOpenSlug);
    if (element) (element as HTMLDetailsElement).open = true;
    setPendingOpenSlug(undefined);
    setFeedback(undefined);
  }, [pendingOpenSlug, flatPages, setFeedback]);

  if (!tour) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    event.activatorEvent.preventDefault();
    if (over && active.id !== over.id) {
      const oldIndex = flatPages.findIndex((page) => page.id == active.id);
      const newIndex = flatPages.findIndex((page) => page.id == over.id);
      reorderFlatPages(oldIndex, newIndex);
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

  // Linking goes out right away so the new page comes back with everything
  // the server fills in.
  const createJoin = async (data: TServerResponse) => {
    setFeedback({ type: "success", message: "Adding Page to Tour." });
    addFlatPage(data as TFlatPage);
    if (await flushTour()) setPendingOpenSlug((data as TFlatPage).slug);
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
      await createJoin(data);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create page."),
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
        <SortableContext
          items={flatPages}
          strategy={verticalListSortingStrategy}
        >
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
            {flatPages.map((flatPage) => (
              <FlatPage
                key={flatPage.id}
                flatPage={flatPage}
                onDelete={() => removeFlatPage(flatPage.id)}
              />
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
