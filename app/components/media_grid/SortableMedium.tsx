import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteButton from "../buttons/DeleteButton";
import EditButton from "../buttons/EditButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, type SetStateAction } from "react";
import { useTourStore } from "~/store/tourStore";
import TextInput from "../inputs/TextInput";
import ToolTip from "../inputs/ToolTip";
import FileUpload from "../inputs/FileUpload";
import ScrollableModal from "../ScrollableModal";
import RetryingImage from "./RetryingImage";
import SelectInput from "../inputs/SelectInput";
import MissingAltTextBadge from "./MissingAltTextBadge";
import DecorativeBadge from "./DecorativeBadge";
import {
  MIN_ALT_TEXT_WORDS,
  altTextWords,
  hasAltText,
  needsAltText,
} from "~/utils/altText";
import type { TMedium } from "~/types";

interface Props {
  medium: TMedium;
  onDelete: () => void;
  // Opens the editor, e.g. right after an upload, so alt text gets added.
  openEditor?: boolean;
  onEditorClosed?: () => void;
}

const SortableMedium = ({
  medium,
  onDelete,
  openEditor = false,
  onEditorClosed,
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: medium.id });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const applySavedField = useTourStore((s) => s.applySavedField);
  const missingAlt = needsAltText(medium);
  const words = altTextWords(medium.alt_text);
  const notClosableReason = `This image can't be closed until it has alt text of at least ${MIN_ALT_TEXT_WORDS} words, or is marked decorative. Screen reader users rely on it, and the tour can't be published without it.`;

  useEffect(() => {
    if (openEditor) setModalOpen(true);
  }, [openEditor]);

  const setEditorOpen = (action: SetStateAction<boolean>) => {
    const open = typeof action === "function" ? action(modalOpen) : action;
    setModalOpen(open);
    if (!open) onEditorClosed?.();
  };

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
          {missingAlt && <MissingAltTextBadge />}
          {medium.decorative && <DecorativeBadge />}
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
        setIsOpen={setEditorOpen}
        title={"Medium"}
        closable={!missingAlt}
        notClosableReason={notClosableReason}
      >
        <div>
          {medium.embed ? (
            <>
              {/* Holds a small space for the image while it loads. */}
              <div className="relative mx-auto min-h-32 max-w-md">
                <RetryingImage
                  src={medium.files.tablet}
                  alt={medium.caption ?? ""}
                  className="mx-auto"
                  explain
                />
              </div>
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
            <div className="relative mx-auto min-h-32 max-w-md">
              <RetryingImage
                src={medium.files.tablet}
                alt={medium.caption ?? ""}
                className="mx-auto"
                explain
              />
            </div>
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
          <TextInput
            type="text-area"
            id="alt_text"
            label="Alt Text"
            model="medium"
            value={medium.alt_text ?? ""}
            itemId={medium.id}
            helpText={`Describe what the image shows for people using screen readers, in a sentence or two (at least ${MIN_ALT_TEXT_WORDS} words). Don't repeat the caption or start with 'Image of'.`}
          />
          {missingAlt && words > 0 && (
            <p className="mb-2 text-sm text-amber-900">
              {words} of {MIN_ALT_TEXT_WORDS} words
            </p>
          )}
          {/* Only offered while it's the way to finish, or to undo it. */}
          {(!hasAltText(medium) || medium.decorative) && (
            <SelectInput
              itemId={medium.id}
              id="decorative"
              label="Image is decorative"
              model="medium"
              value={Boolean(medium.decorative)}
              helpText="Only for images that add nothing a screen reader user needs, such as a texture or a repeated photo. Decorative images are published without a description."
            />
          )}
        </div>
        {missingAlt && (
          <p className="me-3 self-end text-sm text-amber-900">
            Add alt text or mark the image decorative to finish.
          </p>
        )}
        <button
          className="bg-blue-500 disabled:bg-blue-500/50 rounded-md p-2 text-white w-auto self-end me-3 cursor-pointer"
          onClick={() => setEditorOpen(false)}
          disabled={missingAlt}
        >
          Done
        </button>
      </ScrollableModal>
    </div>
  );
};

export default SortableMedium;
