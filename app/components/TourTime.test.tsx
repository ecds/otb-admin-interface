import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TTour } from "~/types";
import TourTime from "./TourTime";

const loadTour = (fields: Partial<TTour>) =>
  useTourStore.getState().setTour({
    id: 1,
    stops: [],
    media: [],
    ...fields,
  } as unknown as TTour);

describe("TourTime", () => {
  it("shows the estimated time of a published tour", () => {
    loadTour({
      published: true,
      travel_duration: "About 1 hour walking",
      read_duration: "10 minutes reading",
      duration_problems: [],
    });
    render(<TourTime />);
    expect(
      screen.getByText("About 1 hour walking and 10 minutes reading"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("lists what couldn't be worked out, as an alert", () => {
    loadTour({
      published: true,
      travel_duration: " walking",
      read_duration: "10 minutes reading",
      duration_problems: [
        "Google Maps found no walking route from Atlanta to London. Check both stops' locations, or try another travel mode.",
      ],
    });
    render(<TourTime />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "The tour's travel time couldn't be fully worked out",
    );
    expect(alert).toHaveTextContent("from Atlanta to London");
    // No number for the travel part, so only the reading time is shown.
    expect(screen.getByText("10 minutes reading")).toBeInTheDocument();
  });

  it("shows nothing for an unpublished tour", () => {
    loadTour({ published: false, duration_problems: ["stale"] });
    const { container } = render(<TourTime />);
    expect(container).toBeEmptyDOMElement();
  });
});
