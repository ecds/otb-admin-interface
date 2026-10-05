import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import VoiceOverUpload from "./VoiceOverUpload";

vi.mock("~/utils/requests", () => ({
  sendUpload: vi.fn(),
}));

// Language selector is an internal detail; stub it to expose a simple button.
vi.mock("./Language", () => ({
  default: ({
    show,
    onSelect,
    onCancel,
  }: {
    show: boolean;
    onSelect: (l: string) => void;
    onCancel: () => void;
  }) =>
    show ? (
      <div>
        <button onClick={() => onSelect("en")}>Select English</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

import { sendUpload } from "~/utils/requests";

const setFeedback = vi.fn();

const renderUpload = (props = {}) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <VoiceOverUpload tour_id={1} {...props} />
    </FeedbackContext.Provider>,
  );

const selectFile = () => {
  const file = new File(["audio"], "narration.mp3", { type: "audio/mpeg" });
  const input = document.querySelector("input[type=file]") as HTMLInputElement;
  Object.defineProperty(input, "files", { value: [file] });
  fireEvent.change(input);
};

describe("VoiceOverUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      voice_overs: [],
      stops: [{ id: 5, voice_overs: [] }],
    } as unknown as TTour);
  });

  it("renders the upload button", () => {
    renderUpload();
    // FileUpload renders a styled <label> wrapping a hidden file input, not a <button>.
    expect(screen.getByText(/upload voice over/i)).toBeInTheDocument();
  });

  it("shows the language selector after a file is selected", async () => {
    renderUpload();
    selectFile();
    await waitFor(() => {
      expect(screen.getByText("Select English")).toBeInTheDocument();
    });
  });

  it("hides the language selector when cancel is clicked", async () => {
    renderUpload();
    selectFile();
    await waitFor(() => expect(screen.getByText("Cancel")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() =>
      expect(screen.queryByText("Select English")).not.toBeInTheDocument(),
    );
  });

  it("calls sendUpload with the file and language when a language is selected", async () => {
    vi.mocked(sendUpload).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    });
    renderUpload();
    selectFile();
    await waitFor(() =>
      expect(screen.getByText("Select English")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Select English"));
    await waitFor(() => {
      expect(sendUpload).toHaveBeenCalledWith(
        expect.objectContaining({ tenant: "ecds" }),
      );
    });
  });

  it("disables the upload button while saving", async () => {
    let resolve: (v: any) => void;
    vi.mocked(sendUpload).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderUpload();
    selectFile();
    await waitFor(() =>
      expect(screen.getByText("Select English")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Select English"));
    // FileUpload renders a styled <label>; check the hidden file input is disabled.
    await waitFor(() => {
      expect(screen.getByText(/saving/i)).toBeInTheDocument();
      expect(document.querySelector("input[type=file]")).toBeDisabled();
    });
    resolve!({ response: { ok: true } as Response, data: {} } as any);
    await waitFor(() => {
      expect(screen.getByText(/upload voice over/i)).toBeInTheDocument();
      expect(document.querySelector("input[type=file]")).not.toBeDisabled();
    });
  });

  it("shows an error feedback message when the upload fails", async () => {
    vi.mocked(sendUpload).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    });
    renderUpload();
    selectFile();
    await waitFor(() =>
      expect(screen.getByText("Select English")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Select English"));
    await waitFor(() => {
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
  });

  it("adds the uploaded voice over to the tour in the store", async () => {
    const created = {
      id: 30,
      filename: "narration.mp3",
      language: "en",
      source_url: "/n.mp3",
    };
    vi.mocked(sendUpload).mockResolvedValue({
      response: { ok: true } as Response,
      data: created,
    });
    renderUpload();
    selectFile();
    await waitFor(() =>
      expect(screen.getByText("Select English")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Select English"));
    await waitFor(() =>
      expect(useTourStore.getState().tour!.voice_overs).toEqual([created]),
    );
  });

  it("adds a stop's uploaded voice over to that stop only", async () => {
    const created = {
      id: 31,
      filename: "stop.mp3",
      language: "en",
      source_url: "/s.mp3",
    };
    vi.mocked(sendUpload).mockResolvedValue({
      response: { ok: true } as Response,
      data: created,
    });
    renderUpload({ tour_id: undefined, stop_id: 5 });
    selectFile();
    await waitFor(() =>
      expect(screen.getByText("Select English")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Select English"));
    await waitFor(() =>
      expect(useTourStore.getState().tour!.stops[0].voice_overs).toEqual([
        created,
      ]),
    );
    expect(useTourStore.getState().tour!.voice_overs).toEqual([]);
  });
});
