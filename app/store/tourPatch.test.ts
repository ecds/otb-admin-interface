import { describe, it, expect } from "vitest";
import { produce } from "immer";
import { buildTourPatch } from "./tourPatch";
import type { TMedium, TTour } from "~/types";

const medium = (id: number, relation_id: number, position: number) =>
  ({
    id,
    relation_id,
    position,
    title: `Medium ${id}`,
    caption: "",
  }) as TMedium;

const saved = {
  id: 1,
  title: "Tour",
  published: false,
  theme: { id: 1, title: "default" },
  mode: { id: 1, title: "WALKING" },
  modes: [{ id: 1, title: "WALKING", relation_id: 50 }],
  map_overlay: { id: 3, north: 1, south: 0, east: 1, west: 0 },
  media: [medium(7, 70, 1), medium(8, 80, 2)],
  flat_pages: [{ id: 9, relation_id: 90, position: 1, title: "About" }],
  stops: [
    {
      id: 5,
      relation_id: 500,
      position: 1,
      title: "First",
      icon_color: "#000000",
      media: [medium(7, 700, 1)],
    },
    { id: 6, relation_id: 600, position: 2, title: "Second", media: [] },
    { id: 4, relation_id: 400, position: 3, title: "Third", media: [] },
  ],
} as unknown as TTour;

const edit = (recipe: (draft: TTour) => void) => produce(saved, recipe);

describe("buildTourPatch", () => {
  it("returns null when nothing changed", () => {
    expect(buildTourPatch(saved, saved)).toBeNull();
  });

  it("sends only the tour fields that changed", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.title = "Renamed";
      }),
    );
    expect(patch).toEqual({ title: "Renamed" });
  });

  it("ignores fields the endpoint doesn't accept", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.map_icon = "/icon.png";
        t.stop_count = 99;
      }),
    );
    expect(patch).toBeNull();
  });

  it("sends theme and default mode by id", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.theme = { id: 2, title: "dark" };
        t.mode = { id: 3, title: "DRIVING" };
      }),
    );
    expect(patch).toEqual({ theme: { id: 2 }, mode: { id: 3 } });
  });

  it("sends a stop's changed fields against its relation_id", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.stops[1].title = "Renamed";
        t.stops[0].icon_color = "#ff0000";
      }),
    );
    expect(patch).toEqual({
      stops: [
        { relation_id: 500, icon_color: "#ff0000" },
        { relation_id: 600, title: "Renamed" },
      ],
    });
  });

  it("sends every position when the order changes", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.stops = [t.stops[2], t.stops[0], t.stops[1]];
      }),
    );
    expect(patch).toEqual({
      stops: [
        { relation_id: 400, position: 1 },
        { relation_id: 500, position: 2 },
        { relation_id: 600, position: 3 },
      ],
    });
  });

  it("unlinks a removed stop with _destroy and renumbers the rest", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.stops.splice(0, 1);
      }),
    );
    expect(patch).toEqual({
      stops: [
        { relation_id: 600, position: 1 },
        { relation_id: 400, position: 2 },
        { relation_id: 500, _destroy: true },
      ],
    });
  });

  it("unlinks the last stop without sending positions", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.stops.pop();
      }),
    );
    expect(patch).toEqual({ stops: [{ relation_id: 400, _destroy: true }] });
  });

  it("links a new stop by id at its position, with the media it brings", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.stops.push({
          id: 11,
          title: "Copy",
          media: [medium(7, 0, 1)],
        } as unknown as TTour["stops"][number]);
      }),
    );
    expect(patch).toEqual({
      stops: [
        { relation_id: 500, position: 1 },
        { relation_id: 600, position: 2 },
        { relation_id: 400, position: 3 },
        { id: 11, position: 4, media: [{ id: 7, position: 1 }] },
      ],
    });
  });

  it("nests a stop's media changes under the stop", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.stops[0].media[0].caption = "New caption";
        t.stops[1].media.push(medium(8, 0, 1));
      }),
    );
    expect(patch).toEqual({
      stops: [
        {
          relation_id: 500,
          media: [{ relation_id: 700, caption: "New caption" }],
        },
        { relation_id: 600, media: [{ id: 8, position: 1 }] },
      ],
    });
  });

  it("reorders and unlinks tour media", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.media = [t.media[1]];
      }),
    );
    expect(patch).toEqual({
      media: [
        { relation_id: 80, position: 1 },
        { relation_id: 70, _destroy: true },
      ],
    });
  });

  it("sends flat page edits", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.flat_pages[0].body = "<p>Hi</p>";
      }),
    );
    expect(patch).toEqual({
      flat_pages: [{ relation_id: 90, body: "<p>Hi</p>" }],
    });
  });

  it("links and unlinks travel modes by mode id", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.modes = [{ id: 2, title: "BICYCLING", relation_id: 0 }];
      }),
    );
    expect(patch).toEqual({
      modes: [{ id: 2 }, { id: 1, _destroy: true }],
    });
  });

  it("sends changed overlay bounds", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        t.map_overlay!.north = 2;
      }),
    );
    expect(patch).toEqual({ map_overlay: { id: 3, north: 2 } });
  });

  it("sends a cleared value as null", () => {
    const patch = buildTourPatch(
      saved,
      edit((t) => {
        (t.stops[0] as { article_link?: string }).article_link = "x";
      }),
    );
    const cleared = buildTourPatch(
      edit((t) => {
        t.stops[0].article_link = "x";
      }),
      edit((t) => {
        t.stops[0].article_link = undefined;
      }),
    );
    expect(patch).toEqual({ stops: [{ relation_id: 500, article_link: "x" }] });
    expect(cleared).toEqual({
      stops: [{ relation_id: 500, article_link: null }],
    });
  });
});
