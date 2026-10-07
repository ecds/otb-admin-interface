import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TMedium, TTour } from "~/types";
import MediaGrid from "./MediaGrid";

let onDragEnd: (e: unknown) => void;
vi.mock("@dnd-kit/core", async (orig) => ({
  ...(await orig<object>()),
  DndContext: (props: {
    onDragEnd: (e: unknown) => void;
    children: unknown;
  }) => {
    onDragEnd = props.onDragEnd;
    return <>{props.children}</>;
  },
}));

vi.mock("./Embed", () => ({
  default: ({ onSuccess }: { onSuccess: (m: unknown) => void }) => (
    <button onClick={() => onSuccess(mk(99, 3))}>Add Embed</button>
  ),
}));
vi.mock("./FileDrop", () => ({
  default: ({ children }: { children: unknown }) => <>{children}</>,
}));
vi.mock("../inputs/FileUpload", () => ({ default: () => null }));
vi.mock("../ReuseMedia", () => ({ default: () => null }));
vi.mock("./SortableMedium", () => ({
  default: function MockMedium({
    medium,
    onDelete,
  }: {
    medium: TMedium;
    onDelete: () => void;
  }) {
    return (
      <div>
        <span>{medium.title}</span>
        <button onClick={onDelete}>Delete {medium.title}</button>
      </div>
    );
  },
}));

const mk = (id: number, position: number) =>
  ({
    id,
    relation_id: id * 10,
    position,
    title: `M${id}`,
  }) as unknown as TMedium;

const setFeedback = vi.fn();

const renderGrid = (recordModel: "tour" | "stop", recordId: number) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <MediaGrid recordModel={recordModel} recordId={recordId} />
    </FeedbackContext.Provider>,
  );

const tour = () => useTourStore.getState().tour!;

describe("MediaGrid", () => {
  beforeEach(() => {
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      media: [mk(1, 1), mk(2, 2)],
      stops: [{ id: 5, media: [mk(3, 1), mk(4, 2)] }],
    } as unknown as TTour);
  });

  it("shows the tour's media for a tour record", () => {
    renderGrid("tour", 1);
    expect(screen.getByText("M1")).toBeInTheDocument();
    expect(screen.queryByText("M3")).not.toBeInTheDocument();
  });

  it("shows the stop's media for a stop record", () => {
    renderGrid("stop", 5);
    expect(screen.getByText("M3")).toBeInTheDocument();
    expect(screen.queryByText("M1")).not.toBeInTheDocument();
  });

  it("adds new media to the stop in both the edited and saved tour", () => {
    renderGrid("stop", 5);
    fireEvent.click(screen.getByText("Add Embed"));
    expect(tour().stops[0].media.map((m) => m.id)).toEqual([3, 4, 99]);
    // The upload already linked it, so autosave has nothing to send.
    expect(
      useTourStore.getState().saved!.stops[0].media.map((m) => m.id),
    ).toEqual([3, 4, 99]);
    expect(tour().media).toHaveLength(2);
  });

  it("removes deleted media from the store and renumbers the rest", () => {
    renderGrid("tour", 1);
    fireEvent.click(screen.getByText("Delete M1"));
    expect(tour().media.map((m) => [m.id, m.position])).toEqual([[2, 1]]);
  });

  it("reorders a stop's media in the store", () => {
    renderGrid("stop", 5);
    act(() => onDragEnd({ active: { id: 4 }, over: { id: 3 } }));
    expect(tour().stops[0].media.map((m) => [m.id, m.position])).toEqual([
      [4, 1],
      [3, 2],
    ]);
  });
});
