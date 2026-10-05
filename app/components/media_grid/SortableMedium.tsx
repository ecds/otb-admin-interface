import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useTourStore } from "~/store/tourStore";
import TextInput from "../inputs/TextInput";
import ToolTip from "../inputs/ToolTip";
import FileUpload from "../inputs/FileUpload";
import ScrollableModal from "../ScrollableModal";
import RetryingImage from "./RetryingImage";
import type { TMedium } from "~/types";

interface Props {
  medium: TMedium;
  onDelete: () => void;
}

const SortableMedium = ({ medium, onDelete }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: medium.id });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const applySavedField = useTourStore((s) => s.applySavedField);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // A medium can be shared by the tour and several stops; update every copy.
  const imageReplaced = (data: unknown) => {
    applySavedField("medium", medium.id, "files", (data as TMedium).files);
  };

  return (
    <div
      className="w-64 h-80 rounded-md"
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="block max-w-sm border border-black/75 border-default rounded-md shadow-xs bg-gray-200/75">
        <div
          role="button"
          onClick={() => setModalOpen(true)}
          onKeyUp={(event) => {
            if (event.key === "Enter") setModalOpen(true);
          }}
          tabIndex={0}
          {...listeners}
          className="relative flex items-center justify-center bg-gray-200/25 rounded-md h-44 cursor-grab active:cursor-grabbing"
        >
          <RetryingImage
            src={medium.files.mobile}
            alt=""
            className="absolute inset-0 h-full w-full object-contain object-top"
          />
          {medium.embed_id && (
            <FontAwesomeIcon
              icon={faPlayCircle}
              className="relative text-6xl text-white/55"
            />
          )}
        </div>
        <div className="py-6 px-2 text-base overflow-hidden tracking-tight text-heading text-black/75 truncate">
          {medium.position}: {medium.title ?? medium.filename}
        </div>
        <div className="mb-6 flex space-x-2 justify-around items-end text-sm">
          <EditButton onClick={setModalOpen} />
          <DeleteButton removing="image or video" onDelete={onDelete} />
        </div>
      </div>
      <ScrollableModal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        title={"Medium"}
      >
        <div>
          {medium.embed ? (
            <>
              <RetryingImage
                src={medium.files.tablet}
                alt={medium.caption ?? ""}
                className="mx-auto"
              />
              <div className="my-4">
                <FileUpload
                  onSuccess={imageReplaced}
                  className="text-blue-500 underline hover:text-blue-900 cursor-pointer"
                  updateId={medium.id}
                >
                  Replace Image
                </FileUpload>{" "}
                <ToolTip>
                  Replace default image from{" "}
                  {medium.provider ?? "medium provider"}.
                </ToolTip>
              </div>
            </>
          ) : (
            <RetryingImage
              src={medium.files.tablet}
              alt={medium.caption ?? ""}
              className="mx-auto"
            />
          )}
          <TextInput
            type="text"
            id="title"
            label="Title"
            model="medium"
            value={medium.title}
            itemId={medium.id}
            size="small"
          />
          <TextInput
            type="text-area"
            id="caption"
            label="Caption"
            model="medium"
            value={medium.caption}
            itemId={medium.id}
          />
        </div>
        <button
          className="bg-blue-500 rounded-md p-2 text-white w-auto self-end me-3 cursor-pointer"
          onClick={() => setModalOpen(false)}
        >
          Done
        </button>
      </ScrollableModal>
    </div>
  );
};

export default SortableMedium;
