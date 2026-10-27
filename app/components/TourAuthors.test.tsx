import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, FeedbackContext, TourSetContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import type { TTour, TTourSet, TUser } from "~/types";
import TourAuthors from "./TourAuthors";

vi.mock("~/utils/requests", () => ({ request: vi.fn() }));

import { request } from "~/utils/requests";

const setFeedback = vi.fn();
const base = "ecds/v4/admin/tour_authors";
let authors = [
  { id: 1, display_name: "Ada", email: "ada@example.edu", student: false },
];
const candidates = [
  { id: 2, display_name: "Grace", email: "grace@example.edu", student: false },
];

const ok = (data: unknown) =>
  Promise.resolve({ response: { ok: true }, data }) as never;

const renderDialog = ({ admin = true } = {}) =>
  render(
    <AuthContext.Provider
      value={{
        signedIn: true,
        currentUser: { id: 9, super: false } as TUser,
        setCurrentUser: vi.fn(),
        currentTenantAdmin: admin,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <TourSetContext.Provider
        value={{
          tourSet: { subdir: "ecds" } as TTourSet,
          accessRequests: [],
          accessRequestModalOpen: false,
          setAccessRequestModalOpen: vi.fn(),
        }}
      >
        <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
          <TourAuthors />
        </FeedbackContext.Provider>
      </TourSetContext.Provider>
    </AuthContext.Provider>,
  );

const open = async () => {
  fireEvent.click(screen.getByRole("button", { name: /manage tour authors/i }));
  return screen.findByRole("dialog", { name: "Tour authors" });
};

describe("TourAuthors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authors = [
      { id: 1, display_name: "Ada", email: "ada@example.edu", student: false },
    ];
    useTourStore
      .getState()
      .setTour({ id: 5, stops: [], media: [] } as unknown as TTour);
    vi.mocked(request).mockImplementation(({ path, method }) => {
      if (path === `${base}?tour_id=5`) return ok(authors);
      if (path === `${base}/candidates?tour_id=5`) return ok(candidates);
      if (method === "POST") {
        authors = [...authors, { ...candidates[0], student: true }];
        return ok({});
      }
      return ok({});
    });
  });

  it("isn't offered to tour authors", () => {
    renderDialog({ admin: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lists the tour's authors", async () => {
    renderDialog();
    await open();
    expect(await screen.findByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("ada@example.edu")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Ada is a student author" }),
    ).not.toBeChecked();
  });

  it("makes an author a student", async () => {
    renderDialog();
    await open();
    fireEvent.click(
      await screen.findByRole("checkbox", { name: "Ada is a student author" }),
    );
    expect(request).toHaveBeenCalledWith({
      path: `${base}/1`,
      method: "PATCH",
      body: { model: "tour_author", tour_id: 5, student: true },
    });
    expect(
      screen.getByRole("checkbox", { name: "Ada is a student author" }),
    ).toBeChecked();
  });

  it("puts the checkbox back when the change fails", async () => {
    renderDialog();
    await open();
    const checkbox = await screen.findByRole("checkbox", {
      name: "Ada is a student author",
    });
    vi.mocked(request).mockResolvedValueOnce({
      response: { ok: false },
      data: {},
    } as never);
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(setFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" }),
    );
  });

  it("adds someone from the site as a student author", async () => {
    renderDialog();
    await open();
    fireEvent.change(await screen.findByRole("combobox", { name: "Person" }), {
      target: { value: "2" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /add as a student/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add author" }));
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith({
        path: base,
        method: "POST",
        body: {
          model: "tour_author",
          tour_id: 5,
          user_id: "2",
          student: true,
        },
      }),
    );
    expect(await screen.findByText("Grace")).toBeInTheDocument();
  });
});
