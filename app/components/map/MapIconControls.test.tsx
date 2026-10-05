import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import MapIconControls from "./MapIconControls";

vi.mock("~/utils/requests", () => ({ sendUpdate: vi.fn() }));
vi.mock("../stops/IconModal", () => ({ default: () => null }));
vi.mock("../inputs/FileUpload", () => ({
  default: function MockUpload(props: Record<string, any>) {
    return (
      <button onClick={() => props.onSuccess({ map_icon: "/uploaded.png" })}>
        upload {props.join.recordModel} {props.join.recordId}
      </button>
    );
  },
}));
vi.mock("../buttons/DeleteButton", () => ({
  default: function MockDelete({ onDelete }: { onDelete: () => void }) {
    return <button onClick={onDelete}>remove</button>;
  },
}));

import { sendUpdate } from "~/utils/requests";

const onChange = vi.fn();
const setFeedback = vi.fn();

const renderControls = (hasIcon = true) =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <MapIconControls
        target={{ model: "tour_stop", recordId: 30 }}
        hasIcon={hasIcon}
        onChange={onChange}
        removeLabel="Remove"
        removeHelp=""
        uploadHelp=""
      />
    </FeedbackContext.Provider>,
  );

describe("MapIconControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore
      .getState()
      .setTour({ id: 1, tenant: "ecds", stops: [] } as unknown as TTour);
  });

  it("uploads against the target and reports the new icon", () => {
    renderControls();
    fireEvent.click(screen.getByText("upload tour_stop 30"));
    expect(onChange).toHaveBeenCalledWith("/uploaded.png");
  });

  it("hides removal when the target has no icon of its own", () => {
    renderControls(false);
    expect(screen.queryByText("remove")).not.toBeInTheDocument();
  });

  it("clears map_icon_id on the target model", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderControls();
    fireEvent.click(screen.getByText("remove"));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(undefined));
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 30,
        body: expect.objectContaining({
          model: "tour_stop",
          tour_stop: { map_icon_id: null },
        }),
      }),
    );
  });

  it("keeps the icon and reports an error when removal fails", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    } as any);
    renderControls();
    fireEvent.click(screen.getByText("remove"));
    await waitFor(() => expect(setFeedback).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });
});
