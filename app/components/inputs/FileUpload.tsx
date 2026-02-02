import { useContext, useRef } from "react";
import { RecordContext, RelatedContext } from "~/contexts";
import { imageUpload, joinImage } from "~/utils/image_upload";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

interface Props {
  onSuccess?: (arg: unknown) => void;
  fileUploading?: Dispatch<SetStateAction<string | undefined>>;
  btnText?: string;
  children?: ReactNode;
  model?: "medium" | "map_overlay" | "map_icon";
  onStart?: () => void;
  className?: string;
}

const FileUpload = ({
  onSuccess,
  btnText,
  children,
  model = "medium",
  onStart,
  fileUploading,
  className,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { tenant, recordId, recordModel, tour } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);

  const handleFileSelected = async () => {
    if (onStart) onStart();
    if (!inputRef.current) return;
    if (!inputRef.current.files) return;

    for (const file of inputRef.current.files) {
      if (fileUploading) fileUploading(file.name);
      const { response: uploadResponse, data: uploadData } = await imageUpload({
        tenant,
        file,
        model,
      });

      if (relatedModel && relatedType && uploadResponse.ok) {
        const { response, data } = await joinImage({
          relatedType,
          recordModel,
          relatedModel,
          recordId,
          imageId: uploadData.id,
          tenant,
          tourId: tour?.id,
        });
        if (response.ok && onSuccess) {
          onSuccess(data);
        }
      }
    }

    if (fileUploading) fileUploading(undefined);
  };

  return (
    <label
      className={
        className ??
        "text-white hover:text-black file:py-2 h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
      }
    >
      {children ? (
        <>{children}</>
      ) : (
        <>
          <FontAwesomeIcon icon={faUpload} /> {btnText ?? "Upload Files"}
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSelected}
        multiple
        className="hidden"
        accept="image/*"
      />
    </label>
  );
};

export default FileUpload;
