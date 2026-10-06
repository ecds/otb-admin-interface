import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthContext } from "~/contexts";
import type { TUser } from "~/types";
import UsersRoute, { shouldRevalidate } from "./users";

vi.mock("~/components/Navbar", () => ({ default: () => null }));
vi.mock("~/components/UserTourSet", () => ({ default: () => null }));

let nextId = 1;
const user = (email: string, joined: string) =>
  ({
    id: nextId++,
    email,
    display_name: email.split("@")[0],
    date_joined: joined,
    last_sign_in: joined,
    terms_accepted: true,
    tour_sets: [],
  }) as unknown as TUser;

const users = [
  user("bravo@x.org", "Feb 01, 2025"),
  user("alpha@x.org", "Mar 01, 2025"),
  user("charlie@x.org", "Jan 01, 2025"),
];

const loader = vi.fn(() => ({ users, tour_sets: [] }));

const renderUsers = () => {
  const Stub = createRoutesStub([
    {
      path: "/users",
      Component: UsersRoute,
      loader,
      shouldRevalidate,
      HydrateFallback: () => null,
    },
  ]);
  return render(
    <AuthContext.Provider
      value={{
        signedIn: true,
        currentUser: { super: true } as TUser,
        setCurrentUser: vi.fn(),
        currentTenantAdmin: true,
        setCurrentTenantAdmin: vi.fn(),
      }}
    >
      <Stub initialEntries={["/users"]} />
    </AuthContext.Provider>,
  );
};

const emails = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.querySelector("td button")?.textContent);

describe("users route", () => {
  beforeEach(() => loader.mockClear());

  it("sorts by a column, flips on a second click, without reloading", async () => {
    renderUsers();
    await screen.findByText("alpha@x.org");
    expect(loader).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    await waitFor(() =>
      expect(emails()).toEqual(["alpha@x.org", "bravo@x.org", "charlie@x.org"]),
    );

    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    await waitFor(() =>
      expect(emails()).toEqual(["charlie@x.org", "bravo@x.org", "alpha@x.org"]),
    );

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("starts a new column ascending", async () => {
    renderUsers();
    await screen.findByText("alpha@x.org");
    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    fireEvent.click(screen.getByRole("button", { name: /joined/i }));
    await waitFor(() =>
      expect(emails()).toEqual(["charlie@x.org", "bravo@x.org", "alpha@x.org"]),
    );
  });
});

describe("shouldRevalidate", () => {
  const args = (from: string, to: string) =>
    ({
      currentUrl: new URL(`http://x${from}`),
      nextUrl: new URL(`http://x${to}`),
      defaultShouldRevalidate: true,
    }) as Parameters<typeof shouldRevalidate>[0];

  it("skips reloading when only the sort params change", () => {
    expect(
      shouldRevalidate(args("/users", "/users?sort_field=email&sort_dir=asc")),
    ).toBe(false);
    expect(
      shouldRevalidate(
        args(
          "/users?sort_field=email&sort_dir=asc",
          "/users?sort_field=email&sort_dir=desc",
        ),
      ),
    ).toBe(false);
  });

  it("still reloads for an explicit revalidate (same URL)", () => {
    expect(
      shouldRevalidate(
        args("/users?sort_field=email", "/users?sort_field=email"),
      ),
    ).toBe(true);
  });

  it("still reloads when other params or the path change", () => {
    expect(shouldRevalidate(args("/users", "/users?page=2"))).toBe(true);
    expect(shouldRevalidate(args("/users", "/tours"))).toBe(true);
  });
});
