import { describe, it, expect, beforeEach } from "vitest";
import { useTourStore } from "./tourStore";
import type { TTour } from "~/types";

const load = () =>
  useTourStore.getState().setTour({
    id: 1,
    title: "Tour",
    media: [{ id: 7, title: "Shared" }],
    stops: [
      { id: 5, title: "Stop", media: [{ id: 7, title: "Shared" }] },
      { id: 6, title: "Other", media: [] },
    ],
    flat_pages: [{ id: 9, title: "About" }],
    map_overlay: { id: 3, north: 1 },
  } as unknown as TTour);

const tour = () => useTourStore.getState().tour!;
const saved = () => useTourStore.getState().saved!;

describe("editRecord", () => {
  beforeEach(load);
  const edit = (...args: [string, number, string, unknown]) =>
    useTourStore.getState().editRecord(...args);

  it("updates a tour field and leaves the saved copy alone", () => {
    expect(edit("tour", 1, "title", "New")).toBe(true);
    expect(tour().title).toBe("New");
    expect(saved().title).toBe("Tour");
  });

  it("returns false for a record that isn't in the tour", () => {
    const before = tour();
    expect(edit("tour", 2, "title", "New")).toBe(false);
    expect(edit("tour_set", 1, "description", "x")).toBe(false);
    expect(tour()).toBe(before);
  });

  it("updates only the matching stop", () => {
    edit("stop", 5, "title", "Renamed");
    expect(tour().stops.map((s) => s.title)).toEqual(["Renamed", "Other"]);
  });

  it("finds a stop by its tour stop relation_id", () => {
    useTourStore.getState().setTour({
      ...tour(),
      stops: [{ ...tour().stops[0], relation_id: 50 }],
    });
    expect(edit("tour_stop", 50, "icon_color", "#fff")).toBe(true);
    expect(tour().stops[0].icon_color).toBe("#fff");
  });

  it("updates a flat page and the map overlay", () => {
    edit("flat_page", 9, "title", "Info");
    edit("map_overlay", 3, "north", 2);
    expect(tour().flat_pages[0].title).toBe("Info");
    expect(tour().map_overlay!.north).toBe(2);
  });

  it("updates every copy of a medium shared by the tour and stops", () => {
    edit("medium", 7, "title", "Edited");
    expect(tour().media[0].title).toBe("Edited");
    expect(tour().stops[0].media[0].title).toBe("Edited");
  });
});

describe("applySavedField", () => {
  beforeEach(load);

  it("updates both the edited and the saved tour", () => {
    useTourStore.getState().applySavedField("medium", 7, "title", "Server");
    expect(tour().media[0].title).toBe("Server");
    expect(saved().media[0].title).toBe("Server");
  });
});

describe("markSaved", () => {
  beforeEach(load);

  it("takes the server's tour when nothing changed during the save", () => {
    useTourStore.getState().updateTourField("title", "Sent");
    const sent = tour();
    const response = { ...sent, stop_count: 2 } as TTour;
    useTourStore.getState().markSaved(sent, response);
    expect(tour()).toBe(response);
    expect(saved()).toBe(response);
  });

  it("keeps edits made while the save was in flight", () => {
    useTourStore.getState().updateTourField("title", "Sent");
    const sent = tour();
    useTourStore.getState().updateTourField("description", "Typed later");
    useTourStore.getState().markSaved(sent, { ...sent } as TTour);
    expect(tour().description).toBe("Typed later");
    expect(saved().description).toBeUndefined();
  });

  it("fills in join ids for records linked by the save", () => {
    useTourStore.getState().addStop({ id: 8, media: [] } as never);
    const sent = tour();
    useTourStore.getState().updateTourField("title", "Later");
    useTourStore.getState().markSaved(sent, {
      ...sent,
      stops: [...sent.stops.slice(0, 2), { ...sent.stops[2], relation_id: 80 }],
    } as TTour);
    expect(tour().stops[2].relation_id).toBe(80);
  });
});

describe("list edits", () => {
  beforeEach(load);

  it("renumbers stops after a reorder or removal", () => {
    useTourStore.getState().reorderStops(0, 1);
    expect(tour().stops.map((s) => [s.id, s.position])).toEqual([
      [6, 1],
      [5, 2],
    ]);
    useTourStore.getState().removeStop(6);
    expect(tour().stops.map((s) => [s.id, s.position])).toEqual([[5, 1]]);
  });

  it("adds a stop at the end", () => {
    useTourStore.getState().addStop({ id: 8, media: [] } as never);
    expect(tour().stops.at(-1)).toMatchObject({ id: 8, position: 3 });
  });
});

describe("save tracking", () => {
  beforeEach(() =>
    useTourStore.setState({ pendingSaves: 0, lastSaved: undefined }),
  );

  it("stays pending until every overlapping save finishes", () => {
    const { beginSave, endSave } = useTourStore.getState();
    beginSave();
    beginSave();
    endSave(true);
    expect(useTourStore.getState().pendingSaves).toBe(1);
    endSave(true);
    expect(useTourStore.getState().pendingSaves).toBe(0);
  });

  it("records a save time only for successful saves", () => {
    const { beginSave, endSave } = useTourStore.getState();
    beginSave();
    endSave(false);
    expect(useTourStore.getState().lastSaved).toBeUndefined();
    beginSave();
    endSave(true);
    expect(useTourStore.getState().lastSaved).toBeDefined();
  });

  it("clearTour empties the tour", () => {
    load();
    useTourStore.getState().clearTour();
    expect(useTourStore.getState().tour).toBeNull();
  });
});

describe("map icons", () => {
  const setup = () =>
    useTourStore.getState().setTour({
      id: 1,
      map_icon: undefined,
      stops: [
        { id: 5, map_icon: undefined, map_icon_custom: false },
        { id: 6, map_icon: "/own.png", map_icon_custom: true },
      ],
    } as unknown as TTour);

  it("gives the tour's icon to every stop without its own", () => {
    setup();
    useTourStore.getState().setTourMapIcon("/tour.png");
    const [a, b] = useTourStore.getState().tour!.stops;
    expect(useTourStore.getState().tour!.map_icon).toBe("/tour.png");
    expect(a.map_icon).toBe("/tour.png");
    expect(b.map_icon).toBe("/own.png");
  });

  it("removing the tour icon leaves custom stop icons alone", () => {
    setup();
    useTourStore.getState().setTourMapIcon("/tour.png");
    useTourStore.getState().setTourMapIcon(undefined);
    const [a, b] = useTourStore.getState().tour!.stops;
    expect(a.map_icon).toBeUndefined();
    expect(b.map_icon).toBe("/own.png");
  });

  it("a stop's own icon is marked custom", () => {
    setup();
    useTourStore.getState().setStopMapIcon(5, "/mine.png");
    expect(useTourStore.getState().tour!.stops[0]).toMatchObject({
      map_icon: "/mine.png",
      map_icon_custom: true,
    });
  });

  it("removing a stop's own icon falls back to the tour's", () => {
    setup();
    useTourStore.getState().setTourMapIcon("/tour.png");
    useTourStore.getState().setStopMapIcon(6, undefined);
    expect(useTourStore.getState().tour!.stops[1]).toMatchObject({
      map_icon: "/tour.png",
      map_icon_custom: false,
    });
  });
});
