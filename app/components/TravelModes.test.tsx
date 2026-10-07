import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TTour, TTravelMode } from "~/types";
import TravelModes from "./TravelModes";

const modes = [
  { id: 1, title: "WALKING" },
  { id: 2, title: "DRIVING" },
] as TTravelMode[];

const loadTour = (overrides: Partial<TTour> = {}) =>
  useTourStore.getState().setTour({
    id: 5,
    tenant: "ecds",
    modes: [{ ...modes[0], relation_id: 100 }],
    mode: modes[0],
    ...overrides,
  } as unknown as TTour);

const renderModes = () => render(<TravelModes modes={modes} />);

const checkbox = (id: number) => document.getElementById(`mode-${id}`)!;
const radio = (title: string) =>
  document.getElementById(`radio-${title}`) as HTMLInputElement;

describe("TravelModes", () => {
  beforeEach(() => loadTour());

  it("checks only the tour's enabled modes", () => {
    renderModes();
    expect(checkbox(1)).toHaveAttribute("aria-checked", "true");
    expect(checkbox(2)).toHaveAttribute("aria-checked", "false");
  });

  // Saving is autosave's job; these only change the store.
  const tour = () => useTourStore.getState().tour!;

  it("enables a mode in the store", () => {
    renderModes();
    fireEvent.click(checkbox(2));
    expect(tour().modes.map((m) => m.id)).toEqual([1, 2]);
    expect(checkbox(2)).toHaveAttribute("aria-checked", "true");
  });

  it("can disable a mode that was enabled in the same session", () => {
    renderModes();
    fireEvent.click(checkbox(2));
    fireEvent.click(checkbox(2));
    expect(tour().modes.map((m) => m.id)).toEqual([1]);
    expect(checkbox(2)).toHaveAttribute("aria-checked", "false");
  });

  it("updates the default mode in the store", () => {
    loadTour({
      modes: [
        { ...modes[0], relation_id: 100 },
        { ...modes[1], relation_id: 200 },
      ],
    } as Partial<TTour>);
    renderModes();
    fireEvent.click(radio("DRIVING"));
    expect(tour().mode.id).toBe(2);
  });
});
