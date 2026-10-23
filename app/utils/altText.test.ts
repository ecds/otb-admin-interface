import { describe, it, expect } from "vitest";
import { missingAltText, needsAltText } from "./altText";
import type { TMedium, TTour } from "~/types";

const medium = (id: number, fields: Partial<TMedium> = {}) =>
  ({ id, title: `Image ${id}`, ...fields }) as TMedium;

describe("needsAltText", () => {
  it("is true without alt text, unless the image is decorative", () => {
    expect(needsAltText(medium(1))).toBe(true);
    expect(needsAltText(medium(1, { alt_text: "   " }))).toBe(true);
    expect(needsAltText(medium(1, { alt_text: "The pulpit" }))).toBe(false);
    expect(needsAltText(medium(1, { decorative: true }))).toBe(false);
  });
});

describe("missingAltText", () => {
  it("lists each image once with everywhere it's used", () => {
    const shared = medium(1);
    const tour = {
      media: [shared, medium(2, { alt_text: "Described" })],
      stops: [
        { title: "Academy", media: [shared, medium(3, { decorative: true })] },
        { title: "Dry Pond", media: [medium(4)] },
      ],
    } as unknown as TTour;
    expect(
      missingAltText(tour).map(({ medium, usedIn }) => [medium.id, usedIn]),
    ).toEqual([
      [1, ["Tour", "Academy"]],
      [4, ["Dry Pond"]],
    ]);
  });
});
