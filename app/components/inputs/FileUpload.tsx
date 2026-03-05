import { useContext, useRef } from "react";
import {
  FeedbackContext,
  RecordContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import { imageUpload, joinImage } from "~/utils/image_upload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { TModel } from "~/types";

interface Props {
  onSuccess?: (arg: unknown) => void;
  fileUploading?: Dispatch<SetStateAction<string | undefined>>;
  btnText?: string;
  children?: ReactNode;
  model?: TModel;
  onStart?: () => void;
  className?: string;
  updateId?: number;
  attribute?: string;
}

const FileUpload = ({
  onSuccess,
  btnText,
  children,
  model = "medium",
  onStart,
  fileUploading,
  className,
  updateId,
  attribute = "file",
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { tour } = useContext(TourContext);
  const { recordId, recordModel } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);
  const { setFeedback } = useContext(FeedbackContext);

  const handleFileSelected = async () => {
    if (onStart) onStart();
    if (!inputRef.current) return;
    if (!inputRef.current.files) return;

    for (const file of inputRef.current.files) {
      if (fileUploading) fileUploading(file.name);
      setFeedback({ type: "success", message: "File Uploading." });
      const { response: uploadResponse, data: uploadData } = await imageUpload({
        tenant: tour.tenant ?? "public",
        file,
        model,
        recordId: updateId,
        attribute,
      });

      if (uploadResponse.ok && updateId) {
        if (onSuccess) onSuccess(uploadData);
        setFeedback(undefined);
      } else if (relatedModel && relatedType && uploadResponse.ok) {
        const { response, data } = await joinImage({
          relatedType,
          recordModel,
          relatedModel,
          recordId,
          imageId: uploadData.id,
          tenant: tour.tenant ?? "public",
        });
        if (response.ok && onSuccess) {
          onSuccess(data);
          setFeedback(undefined);
        } else if (uploadData.errors) {
          setFeedback({ type: "error", message: uploadData.errors[0].detail });
        } else setFeedback({ type: "error", message: "Unknown Error" });
      } else if (uploadData.errors) {
        setFeedback({ type: "error", message: uploadData.errors[0].detail });
      } else setFeedback({ type: "error", message: "Unknown Error" });
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
