import { useContext, useState } from "react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import FileUpload from "../inputs/FileUpload";
import { Saving } from "../Saving";
import DeleteButton from "../buttons/DeleteButton";
import ToolTip from "../inputs/ToolTip";
import IconModal, { type TIconTarget } from "../stops/IconModal";
import { sendUpdate } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";

interface Props {
  target: TIconTarget;
  // Whether `target` has its own icon (so there is something to remove).
  hasIcon: boolean;
  onChange: (url: string | undefined) => void;
  removeLabel: string;
  removeHelp: string;
  uploadHelp: string;
}

const MapIconControls = ({
  target,
  hasIcon,
  onChange,
  removeLabel,
  removeHelp,
  uploadHelp,
}: Props) => {
  const tenant = useTourStore((s) => s.tour?.tenant);
  const tourId = useTourStore((s) => s.tour?.id);
  const { setFeedback } = useContext(FeedbackContext);
  const [uploading, setUploading] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const iconUploaded = (data: unknown) => {
    onChange((data as { map_icon?: string }).map_icon ?? undefined);
  };

  const removeIcon = async () => {
    if (!tenant || !tourId) return;
    const { response, data } = await sendUpdate({
      tenant,
      record: target.recordId,
      body: {
        model: target.model,
        [target.model]: { map_icon_id: null },
        reindex: { model: "tour", id: tourId },
      },
    });
    if (response.ok) {
      onChange(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not remove the icon."),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        {uploading ? (
          <Saving />
        ) : (
          <FileUpload
            join={{
              relatedModel: "map_icon",
              relatedType: "one",
              recordModel: target.model,
              recordId: target.recordId,
            }}
            model="map_icon"
            onSuccess={iconUploaded}
            fileUploading={setUploading}
            className="text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
          >
            <span className="flex flex-row gap-2">
              Upload New Icon <ToolTip>{uploadHelp}</ToolTip>
            </span>
          </FileUpload>
        )}
      </div>
      <div className="flex flex-row">
        <button
          type="button"
          className="gap-2 text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          Use Existing Icon{" "}
        </button>
        <ToolTip>Reuse a previously added icon.</ToolTip>
      </div>
      <IconModal
        target={target}
        onSelect={onChange}
        open={modalOpen}
        setOpen={setModalOpen}
      />
      {hasIcon && (
        <div className="flex flex-row gap-2">
          <DeleteButton
            removing="Map Icon"
            onDelete={removeIcon}
            className="bg-red-600/75 text-white/90 hover:bg-red-200 hover:text-black/75 drop-shadow-lg px-2 py-1 rounded-sm"
          >
            {removeLabel}
          </DeleteButton>
          <ToolTip>{removeHelp}</ToolTip>
        </div>
      )}
    </div>
  );
};

export default MapIconControls;
