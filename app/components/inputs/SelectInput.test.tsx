import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FeedbackContext } from "~/contexts";
import type { TTour } from "~/types";
import SelectInput from "./SelectInput";
import { useTourStore } from "~/store/tourStore";

vi.mock("~/utils/requests", () => ({
  sendUpdate: vi.fn(),
}));

import { sendUpdate } from "~/utils/requests";

const mockTour = { id: 1, tenant: "ecds" } as unknown as TTour;

const setFeedback = vi.fn();
const feedbackCtx = { feedback: undefined, setFeedback };

const options = [
  { value: "en-US", label: "English" },
  { value: "fr-FR", label: "French" },
];

const renderSelect = (overrides = {}) =>
  render(
    <FeedbackContext.Provider value={feedbackCtx}>
      <SelectInput
        itemId={1}
        id="default_lng"
        label="Language"
        model="tour_set"
        value="en-US"
        options={options}
        {...overrides}
      />
    </FeedbackContext.Provider>,
  );

// Records outside the loaded tour (e.g. tour-set settings) save directly.
describe("SelectInput — dropdown variant, outside the tour", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour(mockTour);
  });

  it("renders with the given value selected", () => {
    renderSelect();
    expect(screen.getByRole("combobox")).toHaveValue("en-US");
  });

  it("calls sendUpdate when the selection changes", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderSelect();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fr-FR" },
    });
    await waitFor(() => {
      expect(sendUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            tour_set: { default_lng: "fr-FR" },
          }),
        }),
      );
    });
  });

  it("does not call sendUpdate if the value hasn't changed", async () => {
    renderSelect();
    // Simulate a change event that keeps the same value
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "en-US" },
    });
    await waitFor(() => {
      expect(sendUpdate).not.toHaveBeenCalled();
    });
  });

  it("disables the select while saving", async () => {
    let resolve: (v: any) => void;
    vi.mocked(sendUpdate).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderSelect();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fr-FR" },
    });
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
    resolve!({ response: { ok: true } as Response, data: {} } as any);
    await waitFor(() => {
      expect(screen.getByRole("combobox")).not.toBeDisabled();
    });
  });

  it("resets to the previous value and reports an error on failure", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    } as any);
    renderSelect();
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fr-FR" },
    });
    await waitFor(() => {
      expect(screen.getByRole("combobox")).toHaveValue("en-US");
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
    });
  });
});

describe("SelectInput — checkbox variant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour(mockTour);
  });

  it("renders a checkbox for boolean values", () => {
    render(
      <FeedbackContext.Provider value={feedbackCtx}>
        <SelectInput
          itemId={1}
          id="published"
          label="Published"
          model="tour"
          value={false}
        />
      </FeedbackContext.Provider>,
    );
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("writes the toggled value to the tour without a request", () => {
    render(
      <FeedbackContext.Provider value={feedbackCtx}>
        <SelectInput
          itemId={1}
          id="published"
          label="Published"
          model="tour"
          value={false}
        />
      </FeedbackContext.Provider>,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(useTourStore.getState().tour!.published).toBe(true);
    expect(sendUpdate).not.toHaveBeenCalled();
  });
});

describe("SelectInput — store sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      default_lng: "en-US",
    } as unknown as TTour);
  });

  it("writes the selection into the store for autosave", () => {
    renderSelect({ model: "tour" });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "fr-FR" },
    });
    expect(useTourStore.getState().tour!.default_lng).toBe("fr-FR");
    expect(sendUpdate).not.toHaveBeenCalled();
  });
});
