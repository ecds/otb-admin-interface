import { useContext, useRef } from "react";
import { RecordContext, RelatedContext } from "~/contexts";
import { imageUpload, joinImage } from "~/utils/image_upload";
import type { ReactNode } from "react";
import type { TMedium } from "~/types";

interface Props {
  onSuccess?: (data: TMedium) => void;
  children?: ReactNode;
}

const FileUpload = ({ onSuccess, children }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { tenant, recordId, recordModel } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);

  const handleFileSelected = async () => {
    if (!inputRef.current) return;
    if (!inputRef.current.files) return;

    for (const file of inputRef.current.files) {
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

  return (
    <label className="text-sm text-white hover:text-black mr-5 file:py-2 px-4 py-2 rounded-full border-0 font-semibold file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer">
      {children ?? "Upload Files"}
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileSelected}
        multiple
        className="hidden"
      />
    </label>
  );
};

export default FileUpload;
