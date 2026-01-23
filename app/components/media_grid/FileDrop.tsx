import { useContext, useState } from "react";
import FileUpload from "../inputs/FileUpload";
import { RecordContext, RelatedContext } from "~/contexts";
import { imageUpload, joinImage } from "~/utils/image_upload";
import type { TMedium } from "~/types";
import type { DragEvent } from "react";

interface Props {
  onSuccess: (data: TMedium) => void;
}

const FileDrop = ({ onSuccess }: Props) => {
  const { tenant, recordId, recordModel } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);
  const [isOver, setIsOver] = useState<boolean>(false);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
    for (const file of event.dataTransfer.files) {
      const { response: uploadResponse, data: uploadData } = await imageUpload({
        tenant,
        file,
      });
      if (relatedModel && relatedType && uploadResponse.ok) {
        const { response, data } = await joinImage({
          relatedType,
          recordModel,
          relatedModel,
          recordId,
          imageId: uploadData.id,
          tenant,
        });
        if (response.ok && onSuccess) {
          onSuccess(data);
        }
      }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    setIsOver(true);
    event.preventDefault();
  };

  return (
    <div
      className="w-full h-16 bg-gray-200 border border-dashed rounded-md flex items-center justify-around text-lg"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsOver(false)}
    >
      <p>
        {isOver ? (
          <>Drop to upload</>
        ) : (
          <>
            Drag and drop images onto this area to upload them or{" "}
            <FileUpload onSuccess={onSuccess}>Upload Images</FileUpload>
          </>
        )}
      </p>
    </div>
  );
};

export default FileDrop;
