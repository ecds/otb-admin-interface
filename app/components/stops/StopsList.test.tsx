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
import type { TStop, TTour } from "~/types";
import StopsList from "./StopsList";

vi.mock("~/utils/requests", () => ({
  sendCreate: vi.fn(),
  sendDelete: vi.fn(),
  sendUpdate: vi.fn(),
}));
vi.mock("~/utils/image_upload", () => ({ joinImage: vi.fn() }));

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

vi.mock("./Stop", () => ({
  default: function Mock1({
    stop,
    onDelete,
  }: {
    stop: TStop;
    onDelete: () => void;
  }) {
    return (
      <div>
        <span>{stop.title}</span>
        <button onClick={onDelete}>Delete {stop.title}</button>
      </div>
    );
  },
}));

let reuseCopy: (s: TStop) => Promise<void>;
vi.mock("../Reuse", () => ({
  default: ({ copy }: { copy: (s: TStop) => Promise<void> }) => {
    reuseCopy = copy;
    return null;
  },
}));

import { sendCreate, sendDelete, sendUpdate } from "~/utils/requests";
import { joinImage } from "~/utils/image_upload";

const mk = (id: number, position: number) =>
  ({
    id,
    relation_id: id * 10,
    position,
    title: `Stop ${id}`,
    slug: `s${id}`,
    media: [],
  }) as unknown as TStop;

const setFeedback = vi.fn();
const ok = (data: unknown = {}) =>
  ({ response: { ok: true } as Response, data }) as any;
const fail = () => ({ response: { ok: false } as Response, data: {} }) as any;

const renderList = () =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <StopsList />
    </FeedbackContext.Provider>,
  );

const storeStops = () => useTourStore.getState().tour!.stops;

describe("StopsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      stops: [mk(1, 1), mk(2, 2), mk(3, 3)],
    } as unknown as TTour);
  });

  it("renders the stops from the store", () => {
    renderList();
    expect(screen.getByText("Stop 1")).toBeInTheDocument();
    expect(screen.getByText("Stop 3")).toBeInTheDocument();
  });

  it("reorders stops in the store and saves only the moved positions", async () => {
    vi.mocked(sendUpdate).mockResolvedValue(ok());
    renderList();
    act(() => onDragEnd({ active: { id: 1 }, over: { id: 2 } }));
    expect(storeStops().map((s) => [s.id, s.position])).toEqual([
      [2, 1],
      [1, 2],
      [3, 3],
    ]);
    await waitFor(() => expect(sendUpdate).toHaveBeenCalledTimes(2));
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 20,
        body: expect.objectContaining({ tour_stop: { position: 1 } }),
      }),
    );
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 10,
        body: expect.objectContaining({ tour_stop: { position: 2 } }),
      }),
    );
  });

  it("does nothing when a stop is dropped on itself", () => {
    renderList();
    act(() => onDragEnd({ active: { id: 1 }, over: { id: 1 } }));
    expect(sendUpdate).not.toHaveBeenCalled();
  });

  it("adds a newly created stop to the store", async () => {
    vi.mocked(sendCreate)
      .mockResolvedValueOnce(ok({ id: 4, slug: "s4" }))
      .mockResolvedValueOnce(ok(mk(4, 4)));
    renderList();
    fireEvent.click(screen.getByText(/create new/i));
    await waitFor(() => expect(storeStops()).toHaveLength(4));
    expect(screen.getByText("Stop 4")).toBeInTheDocument();
    expect(sendCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          tour_stop: { tour_id: 1, stop_id: 4, position: 4 },
        }),
      }),
    );
  });

  it("removes a deleted stop from the store", async () => {
    vi.mocked(sendDelete).mockResolvedValue(ok());
    renderList();
    fireEvent.click(screen.getByText("Delete Stop 2"));
    await waitFor(() => expect(storeStops().map((s) => s.id)).toEqual([1, 3]));
    expect(sendDelete).toHaveBeenCalledWith(
      expect.objectContaining({ record: 20 }),
    );
    expect(screen.queryByText("Stop 2")).not.toBeInTheDocument();
  });

  it("keeps the stop and reports an error when the delete fails", async () => {
    vi.mocked(sendDelete).mockResolvedValue(fail());
    renderList();
    fireEvent.click(screen.getByText("Delete Stop 2"));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(storeStops()).toHaveLength(3);
  });

  it("puts only the successfully copied media on a copied stop", async () => {
    const media = [
      { id: 7, title: "Good" },
      { id: 8, title: "Bad" },
    ];
    vi.mocked(sendCreate)
      .mockResolvedValueOnce(ok({ id: 4, slug: "s4" }))
      .mockResolvedValueOnce(ok(mk(4, 4)));
    vi.mocked(joinImage)
      .mockResolvedValueOnce(ok())
      .mockResolvedValueOnce(fail());
    renderList();
    await act(() => reuseCopy({ ...mk(9, 1), media } as unknown as TStop));
    const copied = storeStops().find((s) => s.id === 4)!;
    expect(copied.media.map((m) => m.id)).toEqual([7]);
    expect(setFeedback).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });
});
