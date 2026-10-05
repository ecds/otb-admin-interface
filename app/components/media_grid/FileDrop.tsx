import { useContext, useState } from "react";
import { FeedbackContext } from "~/contexts";
import { getErrorMessage } from "~/utils/errors";
import { useTenant, useTourStore } from "~/store/tourStore";
import { imageUpload, joinImage } from "~/utils/image_upload";
import type { Dispatch, DragEvent, ReactNode, SetStateAction } from "react";

import type { TJoin } from "~/types";

interface Props {
  join: TJoin;
  onSuccess: (args: unknown) => void;
  children: ReactNode;
  fileSaving: string | undefined;
  setFileSaving: Dispatch<SetStateAction<string | undefined>>;
}

const FileDrop = ({
  join,
  onSuccess,
  children,
  fileSaving,
  setFileSaving,
}: Props) => {
  const tenant = useTenant();
  const beginSave = useTourStore((s) => s.beginSave);
  const endSave = useTourStore((s) => s.endSave);
  const { setFeedback } = useContext(FeedbackContext);
  const [isOver, setIsOver] = useState<boolean>(false);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);

    beginSave();
    let allOk = true;
    for (const file of event.dataTransfer.files) {
      setFileSaving(file.name);
      const { response: uploadResponse, data: uploadData } = await imageUpload({
        tenant,
        file,
      });
      if (uploadResponse.ok) {
        const { response, data } = await joinImage({
          ...join,
          imageId: uploadData.id,
          tenant,
        });
        if (response.ok) {
          onSuccess(data);
        } else {
          allOk = false;
          setFeedback({
            type: "error",
            message: getErrorMessage(data, `Could not add ${file.name}.`),
          });
        }
      } else {
        allOk = false;
        setFeedback({
          type: "error",
          message: getErrorMessage(
            uploadData,
            `Could not upload ${file.name}.`,
          ),
        });
      }
    }
    setFileSaving(undefined);
    endSave(allOk);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    setIsOver(true);
    event.preventDefault();
  };

  return (
    <div
      className={`w-full h-16 ${fileSaving ? "bg-green-300" : "bg-gray-200"} border border-dashed rounded-md flex items-center justify-around text-lg`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
    >
      <p>
        {fileSaving ? (
          <span>UPLOADING: {fileSaving}</span>
        ) : (
          <>
            {isOver ? (
              <>Drop to upload</>
            ) : (
              <>
                Drag and drop images onto this area to upload them or {children}
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
};

export default FileDrop;
