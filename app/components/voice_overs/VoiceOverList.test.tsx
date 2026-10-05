import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour, TVoiceOver } from "~/types";
import VoiceOverList from "./VoiceOverList";

vi.mock("~/utils/requests", () => ({ sendDelete: vi.fn() }));

import { sendDelete } from "~/utils/requests";

const setFeedback = vi.fn();

const tourVOs: TVoiceOver[] = [
  {
    id: 10,
    filename: "en-narration.mp3",
    language: "en",
    source_url: "/en.mp3",
  },
  {
    id: 11,
    filename: "fr-narration.mp3",
    language: "fr",
    source_url: "/fr.mp3",
  },
];
const stopVOs: TVoiceOver[] = [
  { id: 20, filename: "stop-en.mp3", language: "en", source_url: "/s.mp3" },
];

const load = (voice_overs = tourVOs) =>
  useTourStore.getState().setTour({
    id: 1,
    tenant: "ecds",
    voice_overs,
    stops: [{ id: 5, voice_overs: stopVOs }],
  } as unknown as TTour);

const renderList = (stopId?: number) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <VoiceOverList stopId={stopId} />
    </FeedbackContext.Provider>,
  );

const ok = () => ({ response: { ok: true } as Response, data: {} }) as any;
const tour = () => useTourStore.getState().tour!;

describe("VoiceOverList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    load();
  });

  it("renders the tour's voice overs", () => {
    renderList();
    expect(screen.getByText("en-narration.mp3")).toBeInTheDocument();
    expect(screen.queryByText("stop-en.mp3")).not.toBeInTheDocument();
  });

  it("renders a stop's voice overs when given a stopId", () => {
    renderList(5);
    expect(screen.getByText("stop-en.mp3")).toBeInTheDocument();
    expect(screen.queryByText("en-narration.mp3")).not.toBeInTheDocument();
  });

  it("renders nothing when the list is empty", () => {
    load([]);
    const { container } = renderList();
    expect(container).toBeEmptyDOMElement();
  });

  it("removes a deleted voice over from the list and the store", async () => {
    vi.mocked(sendDelete).mockResolvedValue(ok());
    renderList();
    fireEvent.click(screen.getAllByRole("button")[0]);
    await waitFor(() =>
      expect(screen.queryByText("en-narration.mp3")).not.toBeInTheDocument(),
    );
    expect(tour().voice_overs.map((vo) => vo.id)).toEqual([11]);
    expect(sendDelete).toHaveBeenCalledWith(
      expect.objectContaining({ record: 10 }),
    );
  });

  it("removes a stop's voice over from that stop only", async () => {
    vi.mocked(sendDelete).mockResolvedValue(ok());
    renderList(5);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(tour().stops[0].voice_overs).toHaveLength(0));
    expect(tour().voice_overs).toHaveLength(2);
  });

  it("disables delete buttons while a delete is in flight", async () => {
    let resolve: (v: any) => void;
    vi.mocked(sendDelete).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderList();
    fireEvent.click(screen.getAllByRole("button")[0]);
    await waitFor(() =>
      screen
        .getAllByRole("button")
        .forEach((btn) => expect(btn).toBeDisabled()),
    );
    resolve!(ok());
    await waitFor(() =>
      screen
        .getAllByRole("button")
        .forEach((btn) => expect(btn).not.toBeDisabled()),
    );
  });

  it("keeps the voice over and reports an error when the delete fails", async () => {
    vi.mocked(sendDelete).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    } as any);
    renderList();
    fireEvent.click(screen.getAllByRole("button")[0]);
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(tour().voice_overs).toHaveLength(2);
  });
});
