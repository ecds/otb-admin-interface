import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteButton from "./DeleteButton";
import EditButton from "./EditButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import TextInput from "../inputs/TextInput";
import type { TMedium, TServerResponse } from "~/types";

interface Props {
  medium: TMedium;
}

const SortableMedium = ({ medium }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: medium.id });
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = (data: TServerResponse) => {
    medium.title = data.title;
    medium.caption = (data as TMedium).caption;
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
          className={`flex items-center justify-center bg-gray-200/25 rounded-md h-44 cursor-grab active:cursor-grabbing bg-top bg-contain bg-no-repeat`}
          style={{ backgroundImage: `url(${medium.files.mobile})` }}
        >
          {medium.video && (
            <FontAwesomeIcon
              icon={faPlayCircle}
              className="text-6xl text-white/55"
            />
          )}
        </div>
        <div className="py-6 px-2 text-base overflow-hidden tracking-tight text-heading text-black/75 truncate">
          {medium.position}: {medium.title ?? medium.filename}
        </div>
        <div className="mb-6 flex space-x-2 justify-around items-end text-sm">
          <EditButton onClick={setModalOpen} />
          <DeleteButton removing="image or video" />
        </div>
      </div>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogBackdrop className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 bg-white p-12 flex flex-col">
            <div>
              {medium.embed ? (
                <div className="mx-auto my-6 px-6 pb-[56.25%] relative block w-full">
                  <iframe
                    className="m-auto absolute top-0 left-0"
                    width="100%"
                    height="100%"
                    title="Embed to add"
                    src={medium.embed}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img
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
                updateCallback={handleUpdate}
                size="small"
              />
              <TextInput
                type="text-area"
                id="caption"
                label="Caption"
                model="medium"
                value={medium.caption}
                itemId={medium.id}
                updateCallback={handleUpdate}
              />
            </div>
            <button
              className="bg-blue-500 rounded-md p-2 text-white w-auto self-end me-3 cursor-pointer"
              onClick={() => setModalOpen(false)}
            >
              Done
            </button>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default SortableMedium;
