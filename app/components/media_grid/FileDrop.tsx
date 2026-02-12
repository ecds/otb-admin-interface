import { useContext, useState } from "react";
import { RecordContext, RelatedContext, TourContext } from "~/contexts";
import { imageUpload, joinImage } from "~/utils/image_upload";
import type { Dispatch, DragEvent, ReactNode, SetStateAction } from "react";

interface Props {
  onSuccess: (args: unknown) => void;
  children: ReactNode;
  fileSaving: string | undefined;
  setFileSaving: Dispatch<SetStateAction<string | undefined>>;
}

const FileDrop = ({
  onSuccess,
  children,
  fileSaving,
  setFileSaving,
}: Props) => {
  const { tour, setIsSaving } = useContext(TourContext);
  const { recordId, recordModel } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);
  const [isOver, setIsOver] = useState<boolean>(false);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);

    for (const file of event.dataTransfer.files) {
      setFileSaving(file.name);
      setIsSaving(true);
      const { response: uploadResponse, data: uploadData } = await imageUpload({
        tenant: tour.tenant,
        file,
      });
      if (relatedModel && relatedType && uploadResponse.ok) {
        const { response, data } = await joinImage({
          relatedType,
          recordModel,
          relatedModel,
          recordId,
          imageId: uploadData.id,
          tenant: tour.tenant,
          tourId: tour?.id,
        });
        if (response.ok && onSuccess) {
          onSuccess(data);
        }
      }
    }
    setFileSaving(undefined);
    setIsSaving(false);
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
