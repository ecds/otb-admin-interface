import type { TModel, TRelateModel } from "~/types";
import { sendCreate, sendUpload } from "./requests";

interface ImageUploadProps {
  file: File;
  tenant: string;
}

interface ImageJoinProps {
  relatedType: "one" | "many";
  recordModel: TModel;
  relatedModel: TRelateModel;
  recordId: number;
  imageId: number;
  tenant: string;
}

const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const imageUpload = async ({ file, tenant }: ImageUploadProps) => {
  if (!imageTypes.includes(file.type))
    return {
      response: { ok: false },
      data: { error: `${file.name} is not an image.` },
    };

  const body = new FormData();
  body.append("model", "medium");
  body.append("medium[file]", file);
  body.append("medium[filename]", file.name);
  return await sendUpload({
    tenant,
    body,
  });
};

export const joinImage = async ({
  relatedType,
  recordModel,
  relatedModel,
  recordId,
  imageId,
  tenant,
}: ImageJoinProps) => {
  const body =
    relatedType === "many"
      ? {
          model: relatedModel,
          [relatedModel]: {
            [`${recordModel}_id`]: recordId,
            medium_id: imageId,
          },
        }
      : {
          model: recordModel,
        };
  return await sendCreate({
    tenant,
    body,
  });
};
