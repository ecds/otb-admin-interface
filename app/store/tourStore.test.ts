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
const apply = useTourStore.getState().applySavedField;

describe("applySavedField", () => {
  beforeEach(load);

  it("updates a tour field", () => {
    apply("tour", 1, "title", "New");
    expect(tour().title).toBe("New");
  });

  it("ignores a tour id that isn't the loaded tour", () => {
    apply("tour", 2, "title", "New");
    expect(tour().title).toBe("Tour");
  });

  it("updates only the matching stop", () => {
    apply("stop", 5, "title", "Renamed");
    expect(tour().stops.map((s) => s.title)).toEqual(["Renamed", "Other"]);
  });

  it("updates a flat page", () => {
    apply("flat_page", 9, "title", "Info");
    expect(tour().flat_pages[0].title).toBe("Info");
  });

  it("updates the map overlay", () => {
    apply("map_overlay", 3, "north", 2);
    expect(tour().map_overlay!.north).toBe(2);
  });

  it("updates every copy of a medium shared by the tour and stops", () => {
    apply("medium", 7, "title", "Edited");
    expect(tour().media[0].title).toBe("Edited");
    expect(tour().stops[0].media[0].title).toBe("Edited");
  });

  it("does nothing for an unknown model", () => {
    const before = tour();
    apply("tour_set", 1, "description", "x");
    expect(tour()).toBe(before);
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
