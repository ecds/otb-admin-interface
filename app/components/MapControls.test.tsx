import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TMapOverlay, TTour } from "~/types";
import MapControls from "./MapControls";

vi.mock("~/utils/requests", () => ({
  sendUpdate: vi.fn(),
  sendDelete: vi.fn(),
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  useMap: () => ({ getBounds: () => undefined }),
}));
vi.mock("./ClientOnly", () => ({ default: () => null }));
vi.mock("./map/TourMap.client", () => ({ default: () => null }));
vi.mock("./map/MapOverlay.client", () => ({ default: () => null }));
vi.mock("./map/MapOverlayRectangle", () => ({ default: () => null }));
vi.mock("./inputs/SelectInput", () => ({ default: () => null }));
vi.mock("./inputs/TextInput", () => ({ default: () => null }));

// Expose the upload callbacks so tests can simulate a finished upload.
vi.mock("./inputs/FileUpload", () => ({
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

vi.mock("./buttons/DeleteButton", () => ({
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
