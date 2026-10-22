import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { AuthContext } from "~/contexts";
import type { TUser } from "~/types";
import SignInRoute from "./signin";

vi.mock("~/components/SignIn.client", () => ({ default: () => null }));

const renderAt = (url: string, currentUser?: TUser) => {
  const Stub = createRoutesStub([
    { path: "/signin", Component: SignInRoute },
    { path: "/", Component: () => <p>Home</p> },
    { path: "/:tourSet/tours/:id", Component: () => <p>Tour page</p> },
  ]);
  return render(
    <AuthContext.Provider
      value={{
        signedIn: Boolean(currentUser),
        currentUser,
        setCurrentUser: vi.fn(),
        currentTenantAdmin: false,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <Stub initialEntries={[url]} />
    </AuthContext.Provider>,
  );
};

describe("sign-in route", () => {
  it("shows the sign-in page when signed out", () => {
    renderAt("/signin?return_to=%2Fecds%2Ftours%2F12");
    expect(screen.getByText("Open Tour Builder")).toBeInTheDocument();
  });

  it("sends a signed-in user back where they were headed", async () => {
    renderAt("/signin?return_to=%2Fecds%2Ftours%2F12", { id: 1 } as TUser);
    expect(await screen.findByText("Tour page")).toBeInTheDocument();
  });

  it("goes home when there's nowhere to return to", async () => {
    renderAt("/signin", { id: 1 } as TUser);
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });

  it("ignores a return_to that would leave the admin", async () => {
    renderAt("/signin?return_to=%2F%2Fevil.test", { id: 1 } as TUser);
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });
});
