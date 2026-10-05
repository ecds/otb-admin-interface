import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import IconModal from "./IconModal";

vi.mock("~/utils/requests", () => ({ sendUpdate: vi.fn() }));

import { sendUpdate } from "~/utils/requests";

const setFeedback = vi.fn();
const setOpen = vi.fn();
const onSelect = vi.fn();
const icons = [{ id: 42, attributes: { original_image_url: "/pin.png" } }];

const renderModal = (model: "tour" | "tour_stop" = "tour_stop") =>
  render(
    <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
      <IconModal
        target={{ model, recordId: 30 }}
        onSelect={onSelect}
        open
        setOpen={setOpen}
      />
    </FeedbackContext.Provider>,
  );

const pickIcon = async () => {
  const [button] = await screen.findAllByRole("button");
  fireEvent.click(button);
};

describe("IconModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore
      .getState()
      .setTour({ id: 1, tenant: "ecds", stops: [] } as unknown as TTour);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ data: icons }) }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("loads icons for the tour's tenant", async () => {
    renderModal();
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "https://api.opentour.site/ecds/map-icons",
      ),
    );
  });

  it("assigns the chosen icon to the target through the map_icon association", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderModal("tour_stop");
    await pickIcon();
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith("/pin.png"));
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(sendUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        record: 30,
        body: expect.objectContaining({
          model: "tour_stop",
          attribute: "map_icon",
          value: 42,
        }),
      }),
    );
  });

  it("works for the tour itself", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderModal("tour");
    await pickIcon();
    await waitFor(() =>
      expect(sendUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ model: "tour" }),
        }),
      ),
    );
  });

  it("reports an error and keeps the modal open when saving fails", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    } as any);
    renderModal();
    await pickIcon();
    await waitFor(() => expect(setFeedback).toHaveBeenCalled());
    expect(onSelect).not.toHaveBeenCalled();
    expect(setOpen).not.toHaveBeenCalled();
  });
});
