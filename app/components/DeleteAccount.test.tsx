import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthContext, FeedbackContext } from "~/contexts";
import type { TUser } from "~/types";
import DeleteAccount from "./DeleteAccount";

vi.mock("~/utils/requests", () => ({ request: vi.fn() }));

import { request } from "~/utils/requests";

const setCurrentUser = vi.fn();
const setFeedback = vi.fn();

const renderDelete = () =>
  render(
    <AuthContext.Provider
      value={{
        signedIn: true,
        currentUser: { id: 3, email: "ada@example.edu" } as TUser,
        setCurrentUser,
        currentTenantAdmin: false,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<DeleteAccount />} />
            <Route path="/signin" element={<p>Sign in page</p>} />
          </Routes>
        </MemoryRouter>
      </FeedbackContext.Provider>
    </AuthContext.Provider>,
  );

const startDeleting = async () => {
  fireEvent.click(screen.getByRole("button", { name: "Delete my account" }));
  return screen.findByRole("dialog", { name: "Delete your account?" });
};

const confirmButton = () =>
  screen.getAllByRole("button", { name: "Delete my account" }).at(-1)!;

describe("DeleteAccount", () => {
  beforeEach(() => vi.clearAllMocks());

  it("won't delete until your email is typed", async () => {
    renderDelete();
    await startDeleting();
    expect(confirmButton()).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "someone@else.edu" },
    });
    expect(confirmButton()).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: " ADA@example.edu " },
    });
    expect(confirmButton()).toBeEnabled();
  });

  it("deletes the account, signs you out, and goes to sign in", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: true },
      data: {},
    } as never);
    renderDelete();
    await startDeleting();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ada@example.edu" },
    });
    fireEvent.click(confirmButton());
    expect(await screen.findByText("Sign in page")).toBeInTheDocument();
    expect(request).toHaveBeenCalledWith({
      path: "public/v4/admin/users/me",
      method: "DELETE",
    });
    expect(setCurrentUser).toHaveBeenCalledWith(undefined);
  });

  it("explains when the account can't be deleted", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: false },
      data: {
        error: "You're the only super user, so your account can't be deleted.",
      },
    } as never);
    renderDelete();
    await startDeleting();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "ada@example.edu" },
    });
    fireEvent.click(confirmButton());
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith({
        type: "error",
        message:
          "You're the only super user, so your account can't be deleted.",
      }),
    );
    expect(setCurrentUser).not.toHaveBeenCalled();
  });
});
