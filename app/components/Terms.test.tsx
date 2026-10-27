import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, FeedbackContext } from "~/contexts";
import type { TUser } from "~/types";
import Terms from "./Terms";

vi.mock("~/utils/requests", () => ({ sendUpdate: vi.fn() }));

import { sendUpdate } from "~/utils/requests";

const setCurrentUser = vi.fn();
const setFeedback = vi.fn();
const newUser = {
  id: 3,
  email: "ada@example.edu",
  terms_accepted: false,
} as TUser;

const renderTerms = () =>
  render(
    <AuthContext.Provider
      value={{
        signedIn: false,
        currentUser: newUser,
        setCurrentUser,
        currentTenantAdmin: false,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
        <Terms />
      </FeedbackContext.Provider>
    </AuthContext.Provider>,
  );

describe("Terms for a new user", () => {
  beforeEach(() => vi.clearAllMocks());

  it("says the account was created once they agree", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: true },
      data: { ...newUser, terms_accepted: true },
    } as never);
    renderTerms();
    fireEvent.click(await screen.findByRole("button", { name: "Agree" }));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith({
        type: "success",
        message: "You have created an OpenTour account!",
        dismissable: true,
      }),
    );
    expect(setCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({ terms_accepted: true }),
    );
  });

  it("doesn't say so when saving fails", async () => {
    vi.mocked(sendUpdate).mockResolvedValue({
      response: { ok: false },
      data: {},
    } as never);
    renderTerms();
    fireEvent.click(await screen.findByRole("button", { name: "Agree" }));
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(setFeedback).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });
});
