import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { TTour } from "~/types";
import TextInput from "./TextInput";
import { useTourStore } from "~/store/tourStore";

vi.mock("~/utils/requests", () => ({
  sendUpdate: vi.fn(),
}));

import { sendUpdate } from "~/utils/requests";

const mockTour = {
  id: 1,
  tenant: "ecds",
  title: "Test Tour",
} as unknown as TTour;

const renderInput = (props = {}) =>
  render(
    <TextInput
      itemId={1}
      id="title"
      label="Tour Title"
      model="tour"
      value="Original"
      type="text"
      {...props}
    />,
  );

describe("TextInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTourStore
      .getState()
      .setTour({ ...mockTour, title: "Original" } as TTour);
  });

  it("renders with the given value", () => {
    renderInput();
    expect(screen.getByRole("textbox")).toHaveValue("Original");
  });

  it("calls sendUpdate with the new value on blur", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true } as Response,
      data: {},
    } as any);
    renderInput();
    const input = screen.getByRole("textbox");
    fireEvent.input(input, { target: { value: "Updated" } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(sendUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({ tour: { title: "Updated" } }),
        }),
      );
    });
  });

  it("does not call sendUpdate on blur when an onChange prop is provided", async () => {
    const onChange = vi.fn();
    renderInput({ onChange });
    fireEvent.blur(screen.getByRole("textbox"));
    expect(sendUpdate).not.toHaveBeenCalled();
  });

  it("shows a server error message when the save fails", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false } as Response,
      data: { errors: [{ detail: "Title can't be blank" }] },
    } as any);
    renderInput();
    fireEvent.blur(screen.getByRole("textbox"));
    await waitFor(() => {
      expect(screen.getByText("Title can't be blank")).toBeInTheDocument();
    });
  });

  it("resets to the previous value when the save fails", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false } as Response,
      data: {},
    } as any);
    renderInput();
    const input = screen.getByRole("textbox");
    fireEvent.input(input, { target: { value: "Bad Value" } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(input).toHaveValue("Original");
    });
  });

  it("marks a save as pending in the store while the request is in flight", async () => {
    let resolve: (v: any) => void;
    vi.mocked(sendUpdate).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    renderInput();
    fireEvent.blur(screen.getByRole("textbox"));
    expect(useTourStore.getState().pendingSaves).toBe(1);
    resolve!({ response: { ok: true } as Response, data: {} } as any);
    await waitFor(() => {
      expect(useTourStore.getState().pendingSaves).toBe(0);
      expect(useTourStore.getState().lastSaved).toBeDefined();
    });
  });

  describe("store sync", () => {
    it("writes the saved value into the store", async () => {
      vi.mocked(sendUpdate).mockResolvedValue({
        response: { ok: true } as Response,
        data: {},
      } as any);
      renderInput();
      const input = screen.getByRole("textbox");
      fireEvent.input(input, { target: { value: "Updated" } });
      fireEvent.blur(input);
      await waitFor(() =>
        expect(useTourStore.getState().tour!.title).toBe("Updated"),
      );
    });

    it("leaves the store alone when the save fails", async () => {
      vi.mocked(sendUpdate).mockResolvedValue({
        response: { ok: false } as Response,
        data: {},
      } as any);
      renderInput();
      const input = screen.getByRole("textbox");
      fireEvent.input(input, { target: { value: "Bad" } });
      fireEvent.blur(input);
      await waitFor(() => expect(input).toHaveValue("Original"));
      expect(useTourStore.getState().tour!.title).toBe("Original");
    });

    it("stores number fields as numbers", async () => {
      useTourStore.getState().setTour({
        ...mockTour,
        map_overlay: { id: 3, north: 1 },
      } as unknown as TTour);
      vi.mocked(sendUpdate).mockResolvedValue({
        response: { ok: true } as Response,
        data: {},
      } as any);
      renderInput({
        model: "map_overlay",
        id: "north",
        itemId: 3,
        value: 1,
        valueType: "number",
      });
      const input = screen.getByRole("spinbutton");
      fireEvent.input(input, { target: { value: "2.5" } });
      fireEvent.blur(input);
      await waitFor(() =>
        expect(useTourStore.getState().tour!.map_overlay!.north).toBe(2.5),
      );
    });
  });
});
