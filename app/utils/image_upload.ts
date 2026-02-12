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
  model?: "medium" | "map_overlay" | "map_icon";
  recordId?: number;
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

export const imageUpload = async ({
  file,
  tenant,
  model = "medium",
  recordId,
}: ImageUploadProps) => {
  if (!imageTypes.includes(file.type))
    return {
      response: { ok: false },
      data: { error: `${file.name} is not an image.` },
    };

  const body = new FormData();
  body.append("model", model);

  if (recordId) {
    body.append(`[value]`, file);
    body.append(`[attribute]`, "file");
    body.append(`[reindex][id]`, "2");

    return await sendUpdateUpload({
      tenant,
      body,
      recordId,
    });
  }

  body.append(`${model}[file]`, file);
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
