import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router";
import { describe, it, expect, vi } from "vitest";
import { AuthContext } from "~/contexts";
import UsersRoute, {
  shouldRevalidate as usersShouldRevalidate,
} from "~/routes/users";
import type { TUser } from "~/types";
import { shouldRevalidate } from "./root";

vi.mock("~/components/Navbar", () => ({ default: () => null }));
vi.mock("~/components/UserTourSet", () => ({ default: () => null }));

const args = (from: string, to: string) =>
  ({
    currentUrl: new URL(`http://x${from}`),
    nextUrl: new URL(`http://x${to}`),
    defaultShouldRevalidate: true,
  }) as Parameters<typeof shouldRevalidate>[0];

describe("root shouldRevalidate", () => {
  it("skips refetching the session when only the query string changes", () => {
    expect(shouldRevalidate(args("/users", "/users?sort_field=email"))).toBe(
      false,
    );
    expect(shouldRevalidate(args("/x?a=1", "/x?a=2"))).toBe(false);
  });

  it("keeps the default for explicit revalidation and path changes", () => {
    expect(shouldRevalidate(args("/users", "/users"))).toBe(true);
    expect(shouldRevalidate(args("/users", "/tours"))).toBe(true);
  });

  it("does not re-run the root or users loaders when sorting users", async () => {
    const rootLoader = vi.fn(() => ({ session: { id: 1 } }));
    const usersLoader = vi.fn(() => ({
      users: [
        { id: 1, email: "b@x.org", tour_sets: [] },
        { id: 2, email: "a@x.org", tour_sets: [] },
      ],
      tour_sets: [],
    }));
    const Stub = createRoutesStub([
      {
        path: "/",
        Component: Outlet,
        loader: rootLoader,
        shouldRevalidate,
        HydrateFallback: () => null,
        children: [
          {
            path: "users",
            Component: UsersRoute,
            loader: usersLoader,
            shouldRevalidate: usersShouldRevalidate,
          },
        ],
      },
    ]);
    render(
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
    await screen.findByText("a@x.org");
    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    fireEvent.click(screen.getByRole("button", { name: /email/i }));
    await waitFor(() =>
      expect(screen.getAllByRole("row")[1].textContent).toContain("b@x.org"),
    );
    expect(rootLoader).toHaveBeenCalledTimes(1);
    expect(usersLoader).toHaveBeenCalledTimes(1);
  });
});
