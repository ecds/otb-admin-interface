import type { TModel, TRelateModel } from "~/types";
import {
  sendCreate,
  sendUpdate,
  sendUpload,
  type UpdateBody,
} from "./requests";

interface ImageUploadProps {
  file: File;
  tenant: string;
  model?: "medium" | "map_overlay" | "map_icon";
}

interface ImageJoinProps {
  relatedType: "one" | "many";
  recordModel: TModel;
  relatedModel: TRelateModel;
  recordId: number;
  imageId: number;
  tenant: string;
  tourId: number | undefined;
}

const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export const imageUpload = async ({
  file,
  tenant,
  model = "medium",
}: ImageUploadProps) => {
  if (!imageTypes.includes(file.type))
    return {
      response: { ok: false },
      data: { error: `${file.name} is not an image.` },
    };

  const body = new FormData();
  body.append("model", model);
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
  tourId,
}: ImageJoinProps) => {
  const reindex = {
    model: "tour",
    id: tourId ?? 0,
  };

  if (relatedType == "many") {
    const body = {
      model: relatedModel,
      [relatedModel]: {
        [`${recordModel}_id`]: recordId,
        medium_id: imageId,
      },
      reindex,
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
    reindex,
  };

  return await sendUpdate({ tenant, record: recordId, body });
};
