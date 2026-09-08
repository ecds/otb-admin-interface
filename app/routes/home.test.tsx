import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthContext } from "~/contexts";
import type { TUser, TTourSet } from "~/types";

// CreateTourSet uses useRevalidator which requires a data router context.
vi.mock("~/components/CreateTourSet", () => ({
  default: () => <button>Create Tour Set</button>,
}));

// useLoaderData is called inside HomeRoute; stub it before importing the component.
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

import { useLoaderData } from "react-router";
import HomeRoute from "./home";

// ── fixtures ──────────────────────────────────────────────────────────────────

const title = "South Delores";

const tourAuthorUser: TUser = {
  id: 345,
  display_name: "Beulah61",
  email: "Jennie.Nitzsche36@gmail.com",
  super: false,
  current_tenant_admin: false,
  terms_accepted: true,
  access_requests: [],
  date_joined: "Aug 28, 2026",
  last_sign_in: "Sep 08, 2026",
  tour_sets: [],
  tours: [
    {
      tour_set: {
        id: 24,
        name: "ECDS",
        subdir: "ecds",
        created_at: "2026-03-04T16:31:49.322Z",
        updated_at: "2026-08-10T22:03:24.481Z",
      },
      tours: [
        {
          id: 2,
          title,
          published: false,
          published_on: null,
        },
      ],
    },
  ],
} as unknown as TUser;

const emptyTourSets: TTourSet[] = [];

const ecdsUser: TUser = {
  id: 346,
  display_name: "Admin",
  email: "admin@example.com",
  super: false,
  current_tenant_admin: false,
  terms_accepted: true,
  access_requests: [],
  date_joined: "Aug 28, 2026",
  last_sign_in: "Sep 08, 2026",
  tour_sets: [{ id: 397, name: "ECDS", subdir: "ecds" }],
  tours: [],
} as unknown as TUser;

const superUser: TUser = {
  id: 1,
  display_name: "Super",
  email: "super@example.com",
  super: true,
  current_tenant_admin: false,
  terms_accepted: true,
  access_requests: [],
  date_joined: "Aug 28, 2026",
  last_sign_in: "Sep 08, 2026",
  tour_sets: [],
  tours: [],
} as unknown as TUser;

const ecdsLoaderTourSet = {
  id: 397,
  name: "ECDS",
  subdir: "ecds",
} as unknown as TTourSet;

// ── helpers ───────────────────────────────────────────────────────────────────

const authContextValue = (user: TUser | undefined, signedIn = true) => ({
  signedIn,
  currentUser: user,
  setCurrentUser: vi.fn(),
  currentTenantAdmin: false,
  setCurrentTenantAdmin: vi.fn(),
});

const renderHome = (
  user: TUser | undefined,
  tourSets: TTourSet[] = emptyTourSets,
) => {
  vi.mocked(useLoaderData).mockReturnValue({ tourSets });

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authContextValue(user)}>
        <HomeRoute />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe("HomeRoute — tour author (no tour_sets, has tours)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the Tours heading", () => {
    renderHome(tourAuthorUser);
    expect(screen.getByText("Tours")).toBeInTheDocument();
  });

  it("shows the tour-set name as a sub-heading", () => {
    renderHome(tourAuthorUser);
    expect(screen.getByText("ECDS")).toBeInTheDocument();
  });

  it("renders the tour title as a link", () => {
    renderHome(tourAuthorUser);
    const link = screen.getByRole("link", { name: title });
    expect(link).toBeInTheDocument();
  });

  it("links to the edit route for that tour", () => {
    renderHome(tourAuthorUser);
    const link = screen.getByRole("link", { name: title });
    expect(link).toHaveAttribute("href", "/ecds/edit/2");
  });

  it("does not render the Tour Sites heading (user has no tour_sets)", () => {
    renderHome(tourAuthorUser);
    expect(screen.queryByText("Tour Sites")).not.toBeInTheDocument();
  });

  it("does not render the access-request prompt", () => {
    renderHome(tourAuthorUser);
    expect(
      screen.queryByText(/You have not been added to any tour sites/),
    ).not.toBeInTheDocument();
  });
});

describe("HomeRoute — tour set admin (has tour_sets, no authored tours)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows the Tour Sites heading", () => {
    renderHome(ecdsUser, [ecdsLoaderTourSet]);
    expect(screen.getByText("Tour Sites")).toBeInTheDocument();
  });

  it("renders the tour set name as a link", () => {
    renderHome(ecdsUser, [ecdsLoaderTourSet]);
    const link = screen.getByRole("link", { name: "ECDS" });
    expect(link).toBeInTheDocument();
  });

  it("links to the tour set's index route", () => {
    renderHome(ecdsUser, [ecdsLoaderTourSet]);
    const link = screen.getByRole("link", { name: "ECDS" });
    expect(link).toHaveAttribute("href", "/ecds/");
  });

  it("does not show any tour title links (user has no authored tours)", () => {
    renderHome(ecdsUser, [ecdsLoaderTourSet]);
    // The Tours section header renders even for an empty tours array, but
    // there should be no tour title links.
    expect(
      screen.queryByRole("link", { name: /Erich/ }),
    ).not.toBeInTheDocument();
  });

  it("does not show tour sets the user is not an admin of", () => {
    const otherTourSet = {
      id: 999,
      name: "Other Site",
      subdir: "other",
    } as unknown as TTourSet;
    renderHome(ecdsUser, [ecdsLoaderTourSet, otherTourSet]);
    expect(
      screen.queryByRole("link", { name: "Other Site" }),
    ).not.toBeInTheDocument();
  });
});

describe("HomeRoute — super user", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all tour sets from the loader", () => {
    const tourSets = [
      { id: 1, name: "Site A", subdir: "site-a" },
      { id: 2, name: "Site B", subdir: "site-b" },
    ] as unknown as TTourSet[];
    renderHome(superUser, tourSets);
    expect(screen.getByRole("link", { name: "Site A" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Site B" })).toBeInTheDocument();
  });

  it("links each tour set to its index route", () => {
    const tourSets = [
      { id: 1, name: "Site A", subdir: "site-a" },
    ] as unknown as TTourSet[];
    renderHome(superUser, tourSets);
    expect(screen.getByRole("link", { name: "Site A" })).toHaveAttribute(
      "href",
      "/site-a/",
    );
  });

  it("shows a Create Tour Set option", () => {
    renderHome(superUser, []);
    // CreateTourSet renders a button or link to create a new tour set
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("does not show the Tours heading", () => {
    renderHome(superUser, []);
    expect(screen.queryByText("Tours")).not.toBeInTheDocument();
  });
});
