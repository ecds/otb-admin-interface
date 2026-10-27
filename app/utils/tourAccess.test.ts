import { describe, expect, it } from "vitest";
import { removalBlocked } from "./tourAccess";
import type { TTour, TTourAccess } from "~/types";

const studentAccess: TTourAccess = {
  student: true,
  publish: false,
  delete_tour: false,
  removable_stop_ids: [3],
  removable_medium_ids: [7],
};

const tour = (fields: Partial<TTour>) => ({ id: 1, ...fields }) as TTour;

describe("removalBlocked", () => {
  it("never blocks tour authors or admins", () => {
    expect(
      removalBlocked(tour({ published: true }), "stop", 4),
    ).toBeUndefined();
  });

  it("lets student authors remove what they added before publishing", () => {
    const draft = tour({ published: false, access: studentAccess });
    expect(removalBlocked(draft, "stop", 3)).toBeUndefined();
    expect(removalBlocked(draft, "medium", 7)).toBeUndefined();
    expect(removalBlocked(draft, "stop", 4)).toMatch(
      /only remove stops they added/,
    );
    expect(removalBlocked(draft, "medium", 8)).toMatch(/images they added/);
  });

  it("blocks student authors once the tour is published", () => {
    const live = tour({ published: true, access: studentAccess });
    expect(removalBlocked(live, "stop", 3)).toMatch(
      /once the tour is published/,
    );
  });
});
