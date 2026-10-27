import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { TourSetContext } from "~/contexts";
import type { TTourSet } from "~/types";
import MediaRoute, { clientLoader } from "./media";

vi.mock("~/utils/requests", () => ({ request: vi.fn() }));
vi.mock("~/components/inputs/TextInput", () => ({
  default: ({ label, tenant }: { label: string; tenant?: string }) => (
    <p>
      {label} for {tenant}
    </p>
  ),
}));
vi.mock("~/components/inputs/SelectInput", () => ({
  default: ({ label }: { label: string }) => <p>{label}</p>,
}));
vi.mock("~/components/ScrollableModal", () => ({
  default: ({ children }: { children: unknown }) => (
    <div role="dialog">{children as never}</div>
  ),
}));

import { request } from "~/utils/requests";

const link = (page: number, rel: string) =>
  `<https://api.example.org/ecds/v4/admin/media?page=${page}&per=20>; rel="${rel}"`;

const respond = (
  media: unknown[],
  { links = "", total = media.length }: { links?: string; total?: number } = {},
) =>
  vi.mocked(request).mockResolvedValue({
    response: { ok: true },
    data: media,
    headers: new Headers({
      ...(links && { link: links }),
      "x-total-count": `${total}`,
    }),
  } as never);

const media = [
  { id: 1, title: "Front", files: { mobile: "/1.jpg", tablet: "/1t.jpg" } },
  {
    id: 2,
    title: "Pews",
    alt_text: "Rows of wooden pews",
    files: { mobile: "/2.jpg", tablet: "/2t.jpg" },
  },
  { id: 3, title: "Texture", decorative: true, files: { mobile: "/3.jpg" } },
];

const open = (url = "/ecds/media") => {
  const Stub = createRoutesStub([
    {
      path: "/:tourSet/media",
      Component: MediaRoute,
      loader: clientLoader as never,
      HydrateFallback: () => null,
    },
  ]);
  const tourSet = {
    subdir: "ecds",
    tours: [
      { id: 4, title: "Jackson Area Tour" },
      { id: 9, title: "Campus Tour" },
    ],
  } as unknown as TTourSet;
  return render(
    <TourSetContext.Provider
      value={{
        tourSet,
        accessRequests: [],
        accessRequestModalOpen: false,
        setAccessRequestModalOpen: () => {},
      }}
    >
      <Stub initialEntries={[url]} />
    </TourSetContext.Provider>,
  );
};

const lastPath = () => vi.mocked(request).mock.lastCall![0].path;

describe("media route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists the site's media with the total and badges images needing alt text", async () => {
    respond(media, { total: 3 });
    open();
    expect(await screen.findByText("Front")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("3 images");
    expect(screen.getAllByText(/No alt text/)).toHaveLength(1);
    expect(lastPath()).toBe("ecds/v4/admin/media?page=1&per=20");
  });

  it("shows only images missing alt text when filtered, from page 1", async () => {
    respond(media, { total: 3 });
    open("/ecds/media?page=2");
    await screen.findByText("Front");
    respond([media[0]], { total: 1 });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Only images missing alt text" }),
    );
    await waitFor(() =>
      expect(lastPath()).toBe(
        "ecds/v4/admin/media?page=1&per=20&missing_alt_text=true",
      ),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "1 image needs alt text",
    );
  });

  it("pages using the API's links and shows how many pages there are", async () => {
    respond(media, {
      total: 45,
      links: [link(2, "next"), link(3, "last")].join(", "),
    });
    open();
    await screen.findByText("Front");
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(lastPath()).toBe("ecds/v4/admin/media?page=2&per=20"),
    );
  });

  it("hides the pager when everything fits on one page", async () => {
    respond(media);
    open();
    await screen.findByText("Front");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("edits a medium's alt text for this site", async () => {
    respond(media);
    open();
    fireEvent.click(await screen.findByText("Front"));
    expect(screen.getByRole("dialog")).toHaveTextContent("Alt Text for ecds");
    expect(screen.getByRole("dialog")).toHaveTextContent("Image is decorative");
  });

  it("says when there's nothing left to fix", async () => {
    respond([], { total: 0 });
    open("/ecds/media?missing_alt_text=true");
    expect(
      await screen.findByText(
        "Every image here has alt text or is marked decorative.",
      ),
    ).toBeInTheDocument();
  });

  it("filters to a tour, and back to all tours", async () => {
    respond(media);
    open();
    await screen.findByText("Front");
    const select = screen.getByRole("combobox", { name: "Filter by Tour" });
    fireEvent.change(select, { target: { value: "9" } });
    await waitFor(() =>
      expect(lastPath()).toBe("ecds/v4/admin/media?page=1&per=20&tour_id=9"),
    );
    // The dropdown follows the reloaded page data, which lands just after.
    await waitFor(() => expect(select).toHaveValue("9"));
    fireEvent.change(select, { target: { value: "0" } });
    await waitFor(() =>
      expect(lastPath()).toBe("ecds/v4/admin/media?page=1&per=20"),
    );
  });

  it("lists unused images, which clears the tour filter", async () => {
    respond(media);
    open("/ecds/media?tour_id=4");
    await screen.findByText("Front");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Only unused images" }),
    );
    await waitFor(() =>
      expect(lastPath()).toBe("ecds/v4/admin/media?page=1&per=20&unused=true"),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "3 unused images",
    );
  });
});
