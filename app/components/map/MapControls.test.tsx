import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TMapOverlay, TTour } from "~/types";
import MapControls from "./MapControls";

vi.mock("~/utils/requests", () => ({
  sendUpdate: vi.fn(),
  sendDelete: vi.fn(),
}));

// jsdom has no WebGL, so MapLibre is replaced by a stub that records each
// map it creates.
const maps: { options: { style: unknown }; remove: () => void }[] = [];
vi.mock("maplibre-gl", () => ({
  Map: class {
    options: { style: unknown };
    remove = vi.fn();
    getBounds = () => undefined;
    constructor(options: { style: unknown }) {
      this.options = options;
      maps.push(this);
    }
  },
  LngLat: class {},
  LngLatBounds: class {},
}));
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("~/map_styles", () => ({
  baseStyle: "base",
  blank: "blank",
  hybrid: "hybrid",
  satellite: "satellite",
}));
vi.mock("./MapMarker", () => ({ default: () => null }));
vi.mock("./MapOverlay", () => ({ default: () => null }));
vi.mock("./MapIconControls", () => ({ default: () => null }));
let rectangleMode: string | undefined;
vi.mock("./MapOverlayRectangle", () => ({
  default: ({ mode }: { mode: string }) => {
    rectangleMode = mode;
    return null;
  },
}));
vi.mock("../inputs/SelectInput", () => ({ default: () => null }));
vi.mock("../inputs/TextInput", () => ({ default: () => null }));

// Expose the upload callbacks so tests can simulate a finished upload.
vi.mock("../inputs/FileUpload", () => ({
  default: ({
    onSuccess,
    btnText,
  }: {
    onSuccess: (d: unknown) => void;
    btnText: string;
  }) => (
    <button
      onClick={() => onSuccess({ map_overlay: (globalThis as any).__overlay })}
    >
      {btnText}
    </button>
  ),
}));

vi.mock("../buttons/DeleteButton", () => ({
  default: function Mock1({ onDelete }: { onDelete: () => void }) {
    return <button onClick={onDelete}>Remove</button>;
  },
}));

import { sendDelete, sendUpdate } from "~/utils/requests";

const overlay = {
  id: 9,
  image_url: "/o.png",
  north: 1,
  south: 0,
  east: 1,
  west: 0,
} as TMapOverlay;

const setFeedback = vi.fn();
const ok = () => ({ response: { ok: true } as Response, data: {} }) as any;
const fail = () => ({ response: { ok: false } as Response, data: {} }) as any;

const loadTour = (overrides: Partial<TTour> = {}) =>
  useTourStore.getState().setTour({
    id: 5,
    tenant: "ecds",
    blank_map: true,
    map_type: "roadmap",
    bounds: { north: 1, south: 0, east: 1, west: 0 },
    stops: [],
    ...overrides,
  } as unknown as TTour);

const renderControls = () =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <MapControls />
    </FeedbackContext.Provider>,
  );

describe("MapControls overlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).__overlay = overlay;
  });

  it("puts an uploaded overlay into the store", async () => {
    loadTour();
    renderControls();
    fireEvent.click(screen.getByText("Upload Map Overlay"));
    await waitFor(() =>
      expect(useTourStore.getState().tour!.map_overlay).toEqual(overlay),
    );
    expect(screen.queryByText("Upload Map Overlay")).not.toBeInTheDocument();
  });

  it("removes the overlay and clears blank_map after deleting it", async () => {
    loadTour({ map_overlay: overlay });
    vi.mocked(sendUpdate).mockResolvedValue(ok());
    vi.mocked(sendDelete).mockResolvedValue(ok());
    renderControls();
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() =>
      expect(useTourStore.getState().tour!.map_overlay).toBeUndefined(),
    );
    expect(useTourStore.getState().tour!.blank_map).toBe(false);
    expect(sendDelete).toHaveBeenCalledWith(
      expect.objectContaining({ record: 9 }),
    );
    expect(screen.getByText("Upload Map Overlay")).toBeInTheDocument();
  });

  it("keeps the overlay and reports an error when the delete fails", async () => {
    loadTour({ map_overlay: overlay });
    vi.mocked(sendUpdate).mockResolvedValue(ok());
    vi.mocked(sendDelete).mockResolvedValue(fail());
    renderControls();
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(useTourStore.getState().tour!.map_overlay).toEqual(overlay);
  });

  it("does not delete the overlay if clearing blank_map fails", async () => {
    loadTour({ map_overlay: overlay });
    vi.mocked(sendUpdate).mockResolvedValue(fail());
    renderControls();
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() => expect(setFeedback).toHaveBeenCalled());
    expect(sendDelete).not.toHaveBeenCalled();
    expect(useTourStore.getState().tour!.blank_map).toBe(true);
  });
});

describe("MapControls map", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    maps.length = 0;
    rectangleMode = undefined;
  });

  it("creates the map with the blank style for a blank map", () => {
    loadTour();
    renderControls();
    expect(maps).toHaveLength(1);
    expect(maps[0].options.style).toBe("blank");
  });

  it("uses the tour's map type otherwise", () => {
    loadTour({ blank_map: false, map_type: "satellite" });
    renderControls();
    expect(maps.at(-1)!.options.style).toBe("satellite");
  });

  it("keeps the same map when unrelated tour fields change", () => {
    loadTour();
    renderControls();
    act(() => useTourStore.getState().updateTourField("title", "Edited"));
    act(() => useTourStore.getState().updateTourField("map_overlay", overlay));
    expect(maps).toHaveLength(1);
    expect(maps[0].remove).not.toHaveBeenCalled();
  });

  it("rebuilds the map when the map type changes", () => {
    loadTour({ blank_map: false });
    renderControls();
    act(() => useTourStore.getState().updateTourField("map_type", "hybrid"));
    expect(maps).toHaveLength(2);
    expect(maps[0].remove).toHaveBeenCalled();
    expect(maps[1].options.style).toBe("hybrid");
  });

  const lockToggle = () =>
    screen.getByRole("switch", { name: "Lock Aspect Ratio" });

  it("keeps the aspect ratio locked for a rotated overlay", () => {
    loadTour({ map_overlay: { ...overlay, rotation: 30 } });
    renderControls();
    expect(lockToggle()).toBeDisabled();
    expect(lockToggle()).toBeChecked();
    fireEvent.click(lockToggle());
    expect(rectangleMode).toBe("opposite-fixed");
  });

  it("locks the aspect ratio by default and unlocks it with the toggle", () => {
    loadTour({ map_overlay: overlay });
    renderControls();
    expect(lockToggle()).toBeChecked();
    expect(rectangleMode).toBe("opposite-fixed");
    fireEvent.click(lockToggle());
    expect(rectangleMode).toBe("opposite");
  });
});

describe("MapControls reset aspect ratio", () => {
  const distorted = { ...overlay, width: 400, height: 100 } as TMapOverlay;

  it("fits the overlay to its image's shape in the store", () => {
    loadTour({ map_overlay: distorted });
    renderControls();
    fireEvent.click(screen.getByText("Reset Aspect Ratio"));
    const saved = useTourStore.getState().tour!.map_overlay!;
    expect(saved.east).toBe(distorted.east);
    expect(saved.west).toBe(distorted.west);
    expect(saved.north - saved.south).toBeLessThan(
      distorted.north - distorted.south,
    );
    expect(screen.getByText("Reset Aspect Ratio")).toBeDisabled();
  });

  it("is disabled when the image size isn't known", () => {
    loadTour({ map_overlay: overlay });
    renderControls();
    expect(screen.getByText("Reset Aspect Ratio")).toBeDisabled();
  });
});
