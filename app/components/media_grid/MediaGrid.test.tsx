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
import type { TMedium, TTour } from "~/types";
import MediaGrid from "./MediaGrid";

vi.mock("~/utils/requests", () => ({
  sendDelete: vi.fn(),
  sendUpdate: vi.fn(),
}));

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

import { sendDelete, sendUpdate } from "~/utils/requests";

const mk = (id: number, position: number) =>
  ({
    id,
    relation_id: id * 10,
    position,
    title: `M${id}`,
  }) as unknown as TMedium;

const setFeedback = vi.fn();
const ok = () => ({ response: { ok: true } as Response, data: {} }) as any;
const fail = () => ({ response: { ok: false } as Response, data: {} }) as any;

const renderGrid = (recordModel: "tour" | "stop", recordId: number) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <MediaGrid recordModel={recordModel} recordId={recordId} />
    </FeedbackContext.Provider>,
  );

const tour = () => useTourStore.getState().tour!;

describe("MediaGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("adds new media to the stop in the store", () => {
    renderGrid("stop", 5);
    fireEvent.click(screen.getByText("Add Embed"));
    expect(tour().stops[0].media.map((m) => m.id)).toEqual([3, 4, 99]);
    expect(tour().media).toHaveLength(2);
  });

  it("removes deleted media from the store", async () => {
    vi.mocked(sendDelete).mockResolvedValue(ok());
    renderGrid("tour", 1);
    fireEvent.click(screen.getByText("Delete M1"));
    await waitFor(() => expect(tour().media.map((m) => m.id)).toEqual([2]));
    expect(sendDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 10,
        body: expect.objectContaining({ model: "tour_medium" }),
      }),
    );
  });

  it("keeps media and reports an error when the delete fails", async () => {
    vi.mocked(sendDelete).mockResolvedValue(fail());
    renderGrid("tour", 1);
    fireEvent.click(screen.getByText("Delete M1"));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(tour().media).toHaveLength(2);
  });

  it("reorders a stop's media and saves the new positions", async () => {
    vi.mocked(sendUpdate).mockResolvedValue(ok());
    renderGrid("stop", 5);
    act(() => onDragEnd({ active: { id: 4 }, over: { id: 3 } }));
    expect(tour().stops[0].media.map((m) => [m.id, m.position])).toEqual([
      [4, 1],
      [3, 2],
    ]);
    await waitFor(() => expect(sendUpdate).toHaveBeenCalledTimes(2));
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 40,
        body: expect.objectContaining({
          stop_medium: { position: 1 },
          reindex: { model: "stop", id: 5 },
        }),
      }),
    );
  });
});
