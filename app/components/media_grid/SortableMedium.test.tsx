import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useTourStore } from "~/store/tourStore";
import type { TMedium, TTour } from "~/types";
import SortableMedium from "./SortableMedium";

vi.mock("../inputs/TextInput", () => ({ default: () => null }));
vi.mock("../buttons/DeleteButton", () => ({ default: () => null }));
vi.mock("../ScrollableModal", () => ({
  default: ({ children }: { children: unknown }) => <>{children}</>,
}));
vi.mock("../inputs/FileUpload", () => ({
  default: ({ onSuccess }: { onSuccess: (d: unknown) => void }) => (
    <button
      onClick={() =>
        onSuccess({
          id: 7,
          files: { mobile: "/new-m.jpg", tablet: "/new-t.jpg" },
        })
      }
    >
      Replace Image
    </button>
  ),
}));

const medium = {
  id: 7,
  relation_id: 70,
  position: 1,
  title: "Video",
  embed: true,
  files: { mobile: "/old-m.jpg", tablet: "/old-t.jpg" },
} as unknown as TMedium;

describe("SortableMedium", () => {
  beforeEach(() =>
    useTourStore.getState().setTour({
      id: 1,
      tenant: "ecds",
      media: [medium],
      stops: [{ id: 5, media: [{ ...medium, relation_id: 71 }] }],
    } as unknown as TTour),
  );

  it("applies a replaced image to every copy of the medium in the store", () => {
    render(
      <DndContext>
        <SortableContext items={[medium]}>
          <SortableMedium medium={medium} onDelete={() => {}} />
        </SortableContext>
      </DndContext>,
    );
    fireEvent.click(screen.getByText("Replace Image"));
    const tour = useTourStore.getState().tour!;
    expect(tour.media[0].files.tablet).toBe("/new-t.jpg");
    expect(tour.stops[0].media[0].files.tablet).toBe("/new-t.jpg");
  });
});
