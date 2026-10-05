import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TStop, TTour } from "~/types";
import MarkerStyle from "./MarkerStyle";

let iconProps: Record<string, any>;
vi.mock("./MapIconControls", () => ({
  default: (props: Record<string, any>) => {
    iconProps = props;
    return null;
  },
}));
vi.mock("../inputs/TextInput", () => ({
  default: function MockInput(props: Record<string, any>) {
    return (
      <button
        data-item={props.itemId}
        onClick={() => props.updateCallback({ icon_color: "#00FF00" })}
      >
        {props.model}
      </button>
    );
  },
}));

const stop = {
  id: 3,
  relation_id: 30,
  icon_color: "#D32F2F",
  map_icon: "/tour.png",
  map_icon_custom: false,
} as TStop;

describe("MarkerStyle", () => {
  beforeEach(() =>
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      map_icon: "/tour.png",
      stops: [{ ...stop }],
    } as unknown as TTour),
  );

  it("saves icon color against the tour stop's relation_id", () => {
    render(<MarkerStyle stopId={3} />);
    const input = screen.getByText("tour_stop");
    expect(input.getAttribute("data-item")).toBe("30");
    fireEvent.click(input);
    expect(useTourStore.getState().tour!.stops[0].icon_color).toBe("#00FF00");
  });

  it("targets the tour stop for icon changes", () => {
    render(<MarkerStyle stopId={3} />);
    expect(iconProps.target).toEqual({ model: "tour_stop", recordId: 30 });
  });

  it("only offers removal when the stop has its own icon", () => {
    render(<MarkerStyle stopId={3} />);
    expect(iconProps.hasIcon).toBe(false);
  });

  it("writes icon changes to the stop in the store", () => {
    render(<MarkerStyle stopId={3} />);
    iconProps.onChange("/own.png");
    expect(useTourStore.getState().tour!.stops[0]).toMatchObject({
      map_icon: "/own.png",
      map_icon_custom: true,
    });
  });
});
