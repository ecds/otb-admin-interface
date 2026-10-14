import { describe, it, expect } from "vitest";
import { isImageFile } from "./image_upload";

const file = (name: string, type: string) => new File(["x"], name, { type });

describe("isImageFile", () => {
  it("accepts web image types", () => {
    expect(isImageFile(file("a.jpg", "image/jpeg"))).toBe(true);
    expect(isImageFile(file("a.webp", "image/webp"))).toBe(true);
  });

  it("accepts iPhone HEIC photos, even when the browser reports no type", () => {
    expect(isImageFile(file("IMG_0001.heic", "image/heic"))).toBe(true);
    expect(isImageFile(file("IMG_0001.HEIC", ""))).toBe(true);
    expect(isImageFile(file("photo.heif", ""))).toBe(true);
  });

  it("rejects other files", () => {
    expect(isImageFile(file("notes.pdf", "application/pdf"))).toBe(false);
    expect(isImageFile(file("photo.jp2", "image/jp2"))).toBe(false);
  });
});
