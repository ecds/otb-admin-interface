import type { TModel, TRelateModel } from "~/types";
import {
  sendCreate,
  sendUpdate,
  sendUpdateUpload,
  sendUpload,
  type UpdateBody,
} from "./requests";

interface ImageUploadProps {
  file: File;
  tenant: string;
  model?: TModel;
  recordId?: number;
  attribute?: string;
}

interface ImageJoinProps {
  relatedType: "one" | "many";
  recordModel: TModel;
  relatedModel: TRelateModel;
  recordId: number;
  imageId: number;
  tenant: string;
}

const imageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // iPhone photos; the API converts them to JPEG.
  "image/heic",
  "image/heif",
];

// Browsers often report no type for .heic files, so the extension counts too.
export const isImageFile = (file: File) =>
  imageTypes.includes(file.type) || /\.(heic|heif)$/i.test(file.name);

export const imageUpload = async ({
  file,
  tenant,
  model = "medium",
  recordId,
  attribute = "file",
}: ImageUploadProps) => {
  if (!isImageFile(file))
    return {
      response: { ok: false },
      data: { error: `${file.name} is not an image.` },
    };

  const body = new FormData();
  body.append("model", model);

  if (recordId) {
    body.append(`[${model}][${attribute}]`, file);
    // body.append(`[reindex][id]`, "2");

    return await sendUpdateUpload({
      tenant,
      body,
      recordId,
    });
  }

  body.append(`${model}[${attribute}]`, file);
  body.append(`${model}[filename]`, file.name);

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
  if (relatedType == "many") {
    const body = {
      model: relatedModel,
      [relatedModel]: {
        [`${recordModel}_id`]: recordId,
        medium_id: imageId,
      },
    };
    return await sendCreate({
      tenant,
      body,
    });
  }

  const body: UpdateBody = {
    model: recordModel,
    attribute: relatedModel,
    value: imageId,
    related_model: relatedModel,
    related_type: "belongs_to",
  };

  return await sendUpdate({ tenant, record: recordId, body });
};
