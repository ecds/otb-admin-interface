import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, FeedbackContext } from "~/contexts";
import type { TUser } from "~/types";
import DeleteUnusedMedia from "./DeleteUnusedMedia";

vi.mock("~/utils/requests", () => ({ request: vi.fn() }));

import { request } from "~/utils/requests";

const setFeedback = vi.fn();
const onQueued = vi.fn();

const renderButton = ({ admin = true, superUser = false } = {}) =>
  render(
    <AuthContext.Provider
      value={{
        signedIn: true,
        currentUser: { id: 1, super: superUser } as TUser,
        setCurrentUser: vi.fn(),
        currentTenantAdmin: admin,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
        <DeleteUnusedMedia tenant="ecds" count={12} onQueued={onQueued} />
      </FeedbackContext.Provider>
    </AuthContext.Provider>,
  );

const deleteButton = () =>
  screen.getByRole("button", { name: /delete all 12 unused images/i });

describe("DeleteUnusedMedia", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isn't offered to curators who aren't site admins", () => {
    renderButton({ admin: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is offered to super users", () => {
    renderButton({ admin: false, superUser: true });
    expect(deleteButton()).toBeInTheDocument();
  });

  it("asks first, and does nothing when cancelled", async () => {
    renderButton();
    fireEvent.click(deleteButton());
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Delete 12 unused images?",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(request).not.toHaveBeenCalled();
  });

  it("deletes the site's unused images once confirmed", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: true },
      data: {},
    } as never);
    renderButton();
    fireEvent.click(deleteButton());
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete 12 unused images" }),
    );
    await waitFor(() => expect(onQueued).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith({
      path: "ecds/v4/admin/media/unused",
      method: "DELETE",
    });
    expect(setFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("reports a failure and keeps the list as it is", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: false },
      data: {},
    } as never);
    renderButton();
    fireEvent.click(deleteButton());
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete 12 unused images" }),
    );
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      ),
    );
    expect(onQueued).not.toHaveBeenCalled();
  });
});
