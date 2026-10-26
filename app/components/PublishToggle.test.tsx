import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import PublishToggle from "./PublishToggle";

const loadTour = (media: unknown[], published = false) =>
  useTourStore.getState().setTour({
    id: 1,
    published,
    media,
    stops: [],
  } as unknown as TTour);

const published = () => useTourStore.getState().tour!.published;
const checkbox = () => screen.getByRole("checkbox");

describe("PublishToggle", () => {
  beforeEach(() => loadTour([]));

  it("publishes straight away when every image has alt text", () => {
    loadTour([{ id: 1, title: "Front", alt_text: "The church from the road" }]);
    render(<PublishToggle />);
    fireEvent.click(checkbox());
    expect(published()).toBe(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lists the images that need alt text", async () => {
    loadTour([
      { id: 1, title: "Front" },
      { id: 2, title: "Texture", decorative: true },
    ]);
    render(<PublishToggle />);
    fireEvent.click(checkbox());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("1 image needs alt text");
    expect(dialog).toHaveTextContent("Front (Tour)");
    expect(dialog).not.toHaveTextContent("Texture");
    expect(published()).toBe(false);
  });

  it("won't publish, and offers no way around it", async () => {
    loadTour([{ id: 1, title: "Front" }]);
    render(<PublishToggle />);
    fireEvent.click(checkbox());
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("can't be published yet");
    expect(
      screen.queryByRole("button", { name: /publish/i }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(published()).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("unpublishes without asking", () => {
    loadTour([{ id: 1, title: "Front" }], true);
    render(<PublishToggle />);
    fireEvent.click(checkbox());
    expect(published()).toBe(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
