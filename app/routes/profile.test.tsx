import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthContext } from "~/contexts";
import type { TUser } from "~/types";
import ProfileRoute from "./profile";

vi.mock("~/components/Navbar", () => ({ default: () => null }));
vi.mock("~/components/RequestAccess", () => ({
  default: () => <p>Request form</p>,
}));

const user = {
  id: 3,
  display_name: "Ada Lovelace",
  email: "ada@example.edu",
  super: false,
  terms_accepted: true,
  date_joined: "Oct 01, 2026",
  last_sign_in: "Oct 27, 2026",
  access_requests: [],
  tour_sets: [
    { id: 1, name: "Atlanta Sites", subdir: "atl", role: "Tour Admin" },
  ],
  tours: [
    {
      tour_set: { name: "Emory Campus", subdir: "emory" },
      tours: [
        { id: 10, title: "Quad Walk" },
        { id: 11, title: "Library Tour" },
      ],
      student_tour_ids: [11],
    },
  ],
} as unknown as TUser;

const renderProfile = (currentUser: TUser = user) =>
  render(
    <AuthContext.Provider
      value={{
        signedIn: true,
        currentUser,
        setCurrentUser: vi.fn(),
        currentTenantAdmin: false,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <MemoryRouter>
        <ProfileRoute />
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe("profile", () => {
  it("shows who you're signed in as", () => {
    renderProfile();
    expect(
      screen.getByRole("heading", { level: 1, name: "Ada Lovelace" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ada@example.edu")).toBeInTheDocument();
    expect(screen.getByText(/Accepted/)).toBeInTheDocument();
  });

  it("lists your sites and tours, with your role on each", () => {
    renderProfile();
    const sites = screen.getByRole("heading", { name: "Sites" }).parentElement!;
    expect(
      within(sites).getByRole("link", { name: "Atlanta Sites" }),
    ).toHaveAttribute("href", "/atl/");
    expect(within(sites).getByText("(Site admin)")).toBeInTheDocument();

    const tours = screen.getByRole("heading", {
      name: "Tours on Emory Campus",
    }).parentElement!;
    expect(
      within(tours).getByRole("link", { name: "Library Tour" }),
    ).toHaveAttribute("href", "/emory/edit/11");
    expect(within(tours).getByText("(Student author)")).toBeInTheDocument();
    expect(within(tours).getByText("(Author)")).toBeInTheDocument();
  });

  it("includes requesting access to another site", () => {
    renderProfile();
    expect(
      screen.getByRole("heading", { name: "Request access to another site" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Request form")).toBeInTheDocument();
  });

  it("says so when you haven't been added anywhere", () => {
    renderProfile({ ...user, tour_sets: [], tours: [] });
    expect(
      screen.getByText("You haven't been added to any sites or tours yet."),
    ).toBeInTheDocument();
  });
});
