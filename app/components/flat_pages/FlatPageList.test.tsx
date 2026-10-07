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
import type { TFlatPage, TTour } from "~/types";
import FlatPageList from "./FlatPageList";

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

vi.mock("./FlatPage", () => ({
  default: function Mock1({
    flatPage,
    onDelete,
  }: {
    flatPage: TFlatPage;
    onDelete: () => void;
  }) {
    return (
      <div>
        <span>{flatPage.title}</span>
        <button onClick={onDelete}>Delete {flatPage.title}</button>
      </div>
    );
  },
}));
vi.mock("../Reuse", () => ({ default: () => null }));

import { sendCreate } from "~/utils/requests";
import { flushTour } from "~/utils/autosave";

const mk = (id: number, position: number) =>
  ({
    id,
    relation_id: id * 10,
    position,
    title: `Page ${id}`,
    slug: `p${id}`,
  }) as unknown as TFlatPage;

const setFeedback = vi.fn();
const ok = (data: unknown = {}) =>
  ({ response: { ok: true } as Response, data }) as any;
const dragEvent = (active: number, over: number) => ({
  active: { id: active },
  over: { id: over },
  activatorEvent: { preventDefault: () => {} },
});

const renderList = () =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <FlatPageList />
    </FeedbackContext.Provider>,
  );

const storePages = () => useTourStore.getState().tour!.flat_pages;

describe("FlatPageList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      flat_pages: [mk(1, 1), mk(2, 2), mk(3, 3)],
    } as unknown as TTour);
  });

  it("removes only the deleted page and renumbers the rest", () => {
    renderList();
    fireEvent.click(screen.getByText("Delete Page 2"));
    expect(storePages().map((p) => [p.id, p.position])).toEqual([
      [1, 1],
      [3, 2],
    ]);
    expect(screen.getByText("Page 1")).toBeInTheDocument();
    expect(screen.getByText("Page 3")).toBeInTheDocument();
    expect(screen.queryByText("Page 2")).not.toBeInTheDocument();
  });

  it("reorders pages in the store", () => {
    renderList();
    act(() => onDragEnd(dragEvent(3, 1)));
    expect(storePages().map((p) => [p.id, p.position])).toEqual([
      [3, 1],
      [1, 2],
      [2, 3],
    ]);
  });

  it("adds a newly created page and saves the link right away", async () => {
    vi.mocked(sendCreate).mockResolvedValueOnce(ok(mk(4, 0)));
    renderList();
    fireEvent.click(screen.getByText(/create new/i));
    await waitFor(() => expect(storePages()).toHaveLength(4));
    expect(storePages()[3]).toMatchObject({ id: 4, position: 4 });
    expect(screen.getByText("Page 4")).toBeInTheDocument();
    expect(sendCreate).toHaveBeenCalledTimes(1);
    expect(flushTour).toHaveBeenCalled();
  });
});
