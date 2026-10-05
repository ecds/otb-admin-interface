import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTourStore } from "~/store/tourStore";
import { useTourQuery } from "./useTourQuery";

vi.mock("~/utils/requests", () => ({ request: vi.fn() }));

import { request } from "~/utils/requests";

const tourA = { id: 1, title: "Tour A", tenant: "ecds" };
const tourB = { id: 2, title: "Tour B", tenant: "ecds" };

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

const respond = (tour: unknown) =>
  vi.mocked(request).mockImplementation(
    async ({ path }: { path: string }) =>
      ({
        response: { ok: true, status: 200 } as Response,
        data: path.includes("modes") ? [] : tour,
      }) as any,
  );

describe("useTourQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    useTourStore.getState().clearTour();
  });

  it("loads the fetched tour into the store", async () => {
    respond(tourA);
    renderHook(() => useTourQuery("ecds", "1"), { wrapper });
    await waitFor(() =>
      expect(useTourStore.getState().tour?.title).toBe("Tour A"),
    );
  });

  it("clears the store when the route unmounts", async () => {
    respond(tourA);
    const { unmount } = renderHook(() => useTourQuery("ecds", "1"), {
      wrapper,
    });
    await waitFor(() => expect(useTourStore.getState().tour).not.toBeNull());
    unmount();
    expect(useTourStore.getState().tour).toBeNull();
  });

  it("keeps edits when leaving and returning to the same tour", async () => {
    respond(tourA);
    const first = renderHook(() => useTourQuery("ecds", "1"), { wrapper });
    await waitFor(() => expect(useTourStore.getState().tour).not.toBeNull());
    act(() => useTourStore.getState().updateTourField("title", "Edited"));
    first.unmount();

    renderHook(() => useTourQuery("ecds", "1"), { wrapper });
    await waitFor(() =>
      expect(useTourStore.getState().tour?.title).toBe("Edited"),
    );
    // Served from cache, not refetched.
    expect(
      vi.mocked(request).mock.calls.filter(([o]) => !o.path.includes("modes")),
    ).toHaveLength(1);
  });

  it("does not copy one tour's edits into another tour's cache", async () => {
    respond(tourA);
    const a = renderHook(() => useTourQuery("ecds", "1"), { wrapper });
    await waitFor(() => expect(useTourStore.getState().tour?.id).toBe(1));
    a.unmount();

    respond(tourB);
    const b = renderHook(() => useTourQuery("ecds", "2"), { wrapper });
    await waitFor(() => expect(useTourStore.getState().tour?.id).toBe(2));
    b.unmount();

    expect(
      client.getQueryData<{ tour: { id: number } }>(["tour", "ecds", "1"])!.tour
        .id,
    ).toBe(1);
    expect(
      client.getQueryData<{ tour: { id: number } }>(["tour", "ecds", "2"])!.tour
        .id,
    ).toBe(2);
  });
});
