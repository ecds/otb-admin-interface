import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthContext, FeedbackContext } from "~/contexts";
import type { TMedium, TUser } from "~/types";
import DeleteMedium from "./DeleteMedium";

vi.mock("~/utils/requests", () => ({ request: vi.fn() }));

import { request } from "~/utils/requests";

const setFeedback = vi.fn();
const onDeleted = vi.fn();
const medium = { id: 7, title: "Old map", filename: "map.jpg" } as TMedium;

const renderButton = ({ admin = true } = {}) =>
  render(
    <AuthContext.Provider
      value={{
        signedIn: true,
        currentUser: { id: 1, super: false } as TUser,
        setCurrentUser: vi.fn(),
        currentTenantAdmin: admin,
        setCurrentTenantAdmin: vi.fn(),
        showTerms: false,
        setShowTerms: vi.fn(),
      }}
    >
      <FeedbackContext.Provider value={{ feedback: undefined, setFeedback }}>
        <DeleteMedium tenant="ecds" medium={medium} onDeleted={onDeleted} />
      </FeedbackContext.Provider>
    </AuthContext.Provider>,
  );

const confirmDelete = async () => {
  fireEvent.click(screen.getByRole("button", { name: /delete image/i }));
  fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
};

describe("DeleteMedium", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isn't offered to curators who aren't site admins", () => {
    renderButton({ admin: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("asks first, and does nothing when cancelled", async () => {
    renderButton();
    fireEvent.click(screen.getByRole("button", { name: /delete image/i }));
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Delete Old map?",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(request).not.toHaveBeenCalled();
  });

  it("deletes the image once confirmed", async () => {
    vi.mocked(request).mockResolvedValue({ response: { ok: true } } as never);
    renderButton();
    await confirmDelete();
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(request).toHaveBeenCalledWith({
      path: "ecds/v4/admin/media/7",
      method: "DELETE",
    });
  });

  it("explains when the image has been put to use since", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: false, status: 409 },
    } as never);
    renderButton();
    await confirmDelete();
    await waitFor(() =>
      expect(setFeedback).toHaveBeenCalledWith({
        type: "error",
        message: "Old map is now used in a tour or stop, so it wasn't deleted.",
      }),
    );
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
