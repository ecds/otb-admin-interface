import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { TStop } from "~/types";
import Stop from "./Stop";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: () => {} }),
}));
vi.mock("../map/StopMap", () => ({ default: () => <div>Stop map</div> }));
vi.mock("../inputs/TextInput", () => ({ default: () => null }));
vi.mock("../media_grid/MediaGrid", () => ({ default: () => null }));
vi.mock("../voice_overs/VoiceOverUpload", () => ({ default: () => null }));
vi.mock("../voice_overs/VoiceOverList", () => ({ default: () => null }));
vi.mock("../buttons/DeleteButton", () => ({ default: () => null }));

const stop = { id: 1, slug: "s1", position: 1, title: "First" } as TStop;

const toggle = (details: HTMLDetailsElement, open: boolean) => {
  details.open = open;
  fireEvent(details, new Event("toggle"));
};

describe("Stop", () => {
  it("only builds the stop's map while it's open", () => {
    const { container } = render(<Stop stop={stop} onDelete={() => {}} />);
    const details = container.querySelector("details")!;
    details.scrollIntoView = () => {};
    expect(screen.queryByText("Stop map")).not.toBeInTheDocument();

    toggle(details, true);
    expect(screen.getByText("Stop map")).toBeInTheDocument();

    toggle(details, false);
    expect(screen.queryByText("Stop map")).not.toBeInTheDocument();
  });
});
