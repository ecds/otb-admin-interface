import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TOpenGeographiesPreview, TTour } from "~/types";
import OpenGeographies from "./OpenGeographies";

vi.mock("~/utils/openGeographies", () => ({
  fetchOpenGeographiesPreview: vi.fn(),
}));
vi.mock("./OpenGeographiesStops", () => ({ default: () => null }));

import { fetchOpenGeographiesPreview } from "~/utils/openGeographies";

const found = {
  ok: true as const,
  preview: {
    stop_count: 6,
    problems: ["Dry Pond Methodist lists a medium more than once."],
    stops: [],
  } as unknown as TOpenGeographiesPreview,
};
const url = "https://og.example.org/tours/jackson";

const loadTour = (endpoint = "") =>
  useTourStore.getState().setTour({
    id: 7,
    tenant: "ecds",
    open_geographies_endpoint: endpoint,
  } as unknown as TTour);

const input = () => screen.getByRole("textbox");
const edited = () => useTourStore.getState().tour!.open_geographies_endpoint;
const type = (value: string) =>
  fireEvent.change(input(), { target: { value } });

describe("OpenGeographies source", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadTour();
  });

  it("doesn't save while typing", () => {
    render(<OpenGeographies />);
    type(url);
    expect(edited()).toBe("");
    expect(fetchOpenGeographiesPreview).not.toHaveBeenCalled();
  });

  it("checks a URL without saving it, then saves it when chosen", async () => {
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue(found);
    render(<OpenGeographies />);
    type(url);
    fireEvent.click(screen.getByRole("button", { name: "Check" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Found 6 stops, with 1 thing to check.",
    );
    expect(fetchOpenGeographiesPreview).toHaveBeenCalledWith(
      "ecds",
      7,
      true,
      url,
    );
    expect(edited()).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Use this source" }));
    expect(edited()).toBe(url);
  });

  it("shows why a URL can't be used and doesn't offer to use it", async () => {
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue({
      ok: false,
      error: "internal.test isn't an allowed Open Geographies host.",
    });
    render(<OpenGeographies />);
    type("https://internal.test/x");
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "internal.test isn't an allowed Open Geographies host.",
    );
    expect(
      screen.queryByRole("button", { name: "Use this source" }),
    ).not.toBeInTheDocument();
  });

  it("needs a new check after the URL is changed", async () => {
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue(found);
    render(<OpenGeographies />);
    type(url);
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    await screen.findByRole("button", { name: "Use this source" });
    type(`${url}-2`);
    expect(
      screen.queryByRole("button", { name: "Use this source" }),
    ).not.toBeInTheDocument();
  });

  it("removes the saved source", () => {
    loadTour(url);
    render(<OpenGeographies />);
    expect(input()).toHaveValue(url);
    fireEvent.click(screen.getByRole("button", { name: "Remove source" }));
    expect(edited()).toBe("");
    expect(input()).toHaveValue("");
  });

  it("checks on Enter", async () => {
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue(found);
    render(<OpenGeographies />);
    type(url);
    fireEvent.keyDown(input(), { key: "Enter" });
    await waitFor(() => expect(fetchOpenGeographiesPreview).toHaveBeenCalled());
  });
});
