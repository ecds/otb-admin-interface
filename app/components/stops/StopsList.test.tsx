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

vi.mock("~/utils/requests", () => ({ sendCreate: vi.fn() }));
vi.mock("~/utils/autosave", () => ({
  flushTour: vi.fn(() => Promise.resolve(true)),
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

import { sendCreate } from "~/utils/requests";
import { flushTour } from "~/utils/autosave";

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

  it("reorders stops in the store", () => {
    renderList();
    act(() => onDragEnd({ active: { id: 1 }, over: { id: 2 } }));
    expect(storeStops().map((s) => [s.id, s.position])).toEqual([
      [2, 1],
      [1, 2],
      [3, 3],
    ]);
  });

  it("does nothing when a stop is dropped on itself", () => {
    const before = useTourStore.getState().tour;
    renderList();
    act(() => onDragEnd({ active: { id: 1 }, over: { id: 1 } }));
    expect(useTourStore.getState().tour).toBe(before);
  });

  it("adds a newly created stop and saves the link right away", async () => {
    vi.mocked(sendCreate).mockResolvedValueOnce(ok(mk(4, 0)));
    renderList();
    fireEvent.click(screen.getByText(/create new/i));
    await waitFor(() => expect(storeStops()).toHaveLength(4));
    expect(storeStops()[3]).toMatchObject({ id: 4, position: 4 });
    expect(screen.getByText("Stop 4")).toBeInTheDocument();
    expect(sendCreate).toHaveBeenCalledTimes(1);
    expect(flushTour).toHaveBeenCalled();
  });

  it("removes a deleted stop from the store", () => {
    renderList();
    fireEvent.click(screen.getByText("Delete Stop 2"));
    expect(storeStops().map((s) => s.id)).toEqual([1, 3]);
    expect(screen.queryByText("Stop 2")).not.toBeInTheDocument();
  });

  it("gives a copied stop the original's media to link", async () => {
    const media = [
      { id: 7, title: "One" },
      { id: 8, title: "Two" },
    ];
    vi.mocked(sendCreate).mockResolvedValueOnce(ok({ ...mk(4, 0), media: [] }));
    renderList();
    await act(() => reuseCopy({ ...mk(9, 1), media } as unknown as TStop));
    const copied = storeStops().find((s) => s.id === 4)!;
    expect(copied.media.map((m) => m.id)).toEqual([7, 8]);
    expect(flushTour).toHaveBeenCalled();
  });
});
