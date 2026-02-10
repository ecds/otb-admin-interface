import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RecordContext } from "~/contexts";
import TextInput from "../inputs/TextInput";
import { useRef } from "react";
import type { TFlatPage } from "~/types";
import DeleteButton from "../media_grid/DeleteButton";

const FlatPage = ({ flatPage }: { flatPage: TFlatPage }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: flatPage.id });

  const detailsRef = useRef<HTMLDetailsElement>(null);

  const scrollToFlatPage = () => {
    if (!detailsRef.current) return;
    if (detailsRef.current.open) detailsRef.current.scrollIntoView();
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
          onToggle={scrollToFlatPage}
          name="flat_pages"
          id={flatPage.slug}
          className="grow"
          style={{ scrollMarginTop: "5rem" }}
        >
          <summary className="group grow cursor-pointer">
            <div>
              {flatPage.position}: {flatPage.title}
            </div>
          </summary>
          <div className="bg-white mt-4 p-4 mx-auto w-full text-black/75">
            <RecordContext.Provider
              value={{
                recordId: flatPage.id,
                recordModel: "flat_page",
              }}
            >
              <TextInput
                valueType="text"
                value={flatPage.title}
                id="title"
                label="Title"
                type="text"
                model="stop"
              />
              <TextInput
                type="rich-text"
                value={flatPage.body}
                id="body"
                label="Body"
                model="flat_page"
              />
              <DeleteButton removing="Page from the tour" />
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

export default FlatPage;
