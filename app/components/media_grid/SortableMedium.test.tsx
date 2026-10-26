import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { useTourStore } from "~/store/tourStore";
import type { ReactNode } from "react";
import type { TMedium, TTour } from "~/types";
import SortableMedium from "./SortableMedium";

vi.mock("../inputs/TextInput", () => ({ default: () => null }));
vi.mock("../buttons/DeleteButton", () => ({ default: () => null }));
vi.mock("../ScrollableModal", () => ({
  default: ({
    children,
    closable = true,
    notClosableReason,
  }: {
    children: ReactNode;
    closable?: boolean;
    notClosableReason?: string;
  }) => (
    <>
      {!closable && <p>{notClosableReason}</p>}
      {children}
    </>
  ),
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

  describe("alt text", () => {
    const show = (fields: Partial<TMedium>, openEditor = false) =>
      render(
        <DndContext>
          <SortableContext items={[7]}>
            <SortableMedium
              medium={{ ...medium, ...fields }}
              onDelete={() => {}}
              openEditor={openEditor}
            />
          </SortableContext>
        </DndContext>,
      );

    it("badges a thumbnail that has no alt text", () => {
      show({ alt_text: "Pulpit" });
      expect(screen.getByText(/No alt text/)).toBeInTheDocument();
      expect(screen.queryByText("Decorative")).not.toBeInTheDocument();
    });

    it("badges a decorative image more quietly", () => {
      show({ alt_text: null, decorative: true });
      expect(screen.queryByText(/No alt text/)).not.toBeInTheDocument();
      expect(screen.getByText("Decorative")).toBeInTheDocument();
    });

    it("doesn't badge an image with enough alt text", () => {
      show({ alt_text: "The carved pulpit" });
      expect(screen.queryByText(/No alt text/)).toBeNull();
      expect(screen.queryByText("Decorative")).toBeNull();
    });

    it("explains why the editor can't be closed yet", async () => {
      show({ alt_text: "The pulpit" }, true);
      expect(
        await screen.findByText(
          /can't be closed until it has alt text of at least 3 words/,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("2 of 3 words")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Done" })).toBeDisabled();
    });

    it("closes once the alt text is long enough, and hides the decorative choice", async () => {
      show({ alt_text: "The carved pulpit" }, true);
      expect(await screen.findByRole("button", { name: "Done" })).toBeEnabled();
      expect(screen.queryByText(/can't be closed/)).toBeNull();
      expect(screen.queryByText("Image is decorative")).toBeNull();
    });

    it("keeps the decorative choice for an image marked decorative", async () => {
      show({ alt_text: "The carved pulpit", decorative: true }, true);
      expect(
        await screen.findByText("Image is decorative"),
      ).toBeInTheDocument();
    });

    it("marks the image decorative in the store", () => {
      show({ alt_text: null });
      fireEvent.click(screen.getByRole("checkbox"));
      expect(useTourStore.getState().tour!.media[0].decorative).toBe(true);
      expect(useTourStore.getState().tour!.stops[0].media[0].decorative).toBe(
        true,
      );
    });
  });
});
