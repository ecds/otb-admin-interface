import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
    return <button data-item={props.itemId}>{props.model}</button>;
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

  // The color is sent with the stop's entry in the tour save, which
  // applies it to the tour stop.
  it("edits icon color on the stop", () => {
    render(<MarkerStyle stopId={3} />);
    expect(screen.getByText("stop").getAttribute("data-item")).toBe("3");
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
