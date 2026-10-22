import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TOpenGeographiesPreview, TTour } from "~/types";
import OpenGeographiesStops from "./OpenGeographiesStops";
import { useOpenGeographiesStore } from "~/hooks/useOpenGeographiesPreview";

vi.mock("~/utils/openGeographies", () => ({
  fetchOpenGeographiesPreview: vi.fn(),
}));

import { fetchOpenGeographiesPreview } from "~/utils/openGeographies";

const preview: TOpenGeographiesPreview = {
  context: "https://opengeographies.org/api/v1/context.json",
  version: "v1",
  stop_count: 2,
  bounds: null,
  fetched_at: "2026-10-22T12:00:00Z",
  problems: ["Dry Pond Methodist lists a medium more than once."],
  stops: [
    {
      id: "a",
      slug: "academy",
      title: "Academy Baptist",
      position: 1,
      address: "721 Academy Church Rd, Jefferson, GA 30549",
      lat: 34.13,
      lng: -83.63,
      description_html: "<p>Organized in <a href='/x'>1810</a>.</p>",
      media: [{ title: "Exterior", files: { mobile: "/thumb.jpg" } }],
    },
    {
      id: "b",
      slug: "dry-pond",
      title: "Dry Pond Methodist",
      position: 2,
      lat: 34.19,
      lng: -83.57,
      media: [],
    },
  ],
};

const loadTour = (endpoint?: string) =>
  useTourStore.getState().setTour({
    id: 7,
    tenant: "ecds",
    open_geographies_endpoint: endpoint,
  } as unknown as TTour);

describe("OpenGeographiesStops", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // The preview is shared between components; start each test empty.
    useOpenGeographiesStore.setState(
      { key: undefined, status: "idle", preview: undefined, error: undefined },
      true,
    );
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue({
      ok: true,
      preview,
    });
  });

  it("shows nothing when the tour has no Open Geographies source", () => {
    loadTour(undefined);
    const { container } = render(<OpenGeographiesStops />);
    expect(container).toBeEmptyDOMElement();
    expect(fetchOpenGeographiesPreview).not.toHaveBeenCalled();
  });

  it("lists the stops read-only, with problems to check", async () => {
    loadTour("https://og.example.org/tours/jackson");
    render(<OpenGeographiesStops />);
    expect(await screen.findByText("1: Academy Baptist")).toBeInTheDocument();
    expect(screen.getByText("2: Dry Pond Methodist")).toBeInTheDocument();
    expect(screen.getByText(/^2 stops · checked/)).toBeInTheDocument();
    expect(
      screen.getByText("Dry Pond Methodist lists a medium more than once."),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Exterior")).toHaveAttribute(
      "src",
      "/thumb.jpg",
    );
    expect(screen.getByText("1810")).toHaveAttribute("href", "/x");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(fetchOpenGeographiesPreview).toHaveBeenCalledWith("ecds", 7, false);
  });

  it("refetches, skipping the cache, when Refresh is clicked", async () => {
    loadTour("https://og.example.org/tours/jackson");
    render(<OpenGeographiesStops />);
    await screen.findByText("1: Academy Baptist");
    fireEvent.click(screen.getByRole("button", { name: /refresh/i }));
    await waitFor(() =>
      expect(fetchOpenGeographiesPreview).toHaveBeenLastCalledWith(
        "ecds",
        7,
        true,
      ),
    );
  });

  it("shows why the preview couldn't be made", async () => {
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue({
      ok: false,
      error: "Open Geographies v2 isn't supported yet.",
    });
    loadTour("https://og.example.org/tours/jackson");
    render(<OpenGeographiesStops />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Open Geographies v2 isn't supported yet.",
    );
  });

  it("waits for a new URL to be saved before loading it", async () => {
    loadTour("https://og.example.org/tours/jackson");
    render(<OpenGeographiesStops />);
    await screen.findByText("1: Academy Baptist");
    expect(fetchOpenGeographiesPreview).toHaveBeenCalledTimes(1);

    // Typing changes the edited tour only; nothing is fetched yet.
    act(() =>
      useTourStore
        .getState()
        .updateTourField(
          "open_geographies_endpoint",
          "https://og.example.org/x",
        ),
    );
    expect(fetchOpenGeographiesPreview).toHaveBeenCalledTimes(1);

    // Once the save lands, the new source is loaded.
    act(() => {
      const { tour, markSaved } = useTourStore.getState();
      markSaved(tour!, tour!);
    });
    await waitFor(() =>
      expect(fetchOpenGeographiesPreview).toHaveBeenCalledTimes(2),
    );
  });
});
