import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTourStore } from "~/store/tourStore";
import type { TOpenGeographiesPreview, TTour } from "~/types";
import {
  useOpenGeographiesPreview,
  useOpenGeographiesStore,
} from "./useOpenGeographiesPreview";

vi.mock("~/utils/openGeographies", () => ({
  fetchOpenGeographiesPreview: vi.fn(),
}));

import { fetchOpenGeographiesPreview } from "~/utils/openGeographies";

const preview = (title: string) =>
  ({
    stops: [{ id: title, title }],
    problems: [],
  }) as unknown as TOpenGeographiesPreview;

const loadTour = (endpoint?: string, id = 7) =>
  useTourStore.getState().setTour({
    id,
    tenant: "ecds",
    open_geographies_endpoint: endpoint,
  } as unknown as TTour);

describe("useOpenGeographiesPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useOpenGeographiesStore.setState(
      { key: undefined, status: "idle", preview: undefined, error: undefined },
      true,
    );
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue({
      ok: true,
      preview: preview("Academy"),
    });
  });

  it("loads nothing without a saved source", () => {
    loadTour(undefined);
    const { result } = renderHook(() => useOpenGeographiesPreview());
    expect(result.current.status).toBe("idle");
    expect(fetchOpenGeographiesPreview).not.toHaveBeenCalled();
  });

  it("makes one request for every component that uses it", async () => {
    loadTour("https://og.example.org/a");
    const first = renderHook(() => useOpenGeographiesPreview());
    const second = renderHook(() => useOpenGeographiesPreview());
    await waitFor(() => expect(first.result.current.status).toBe("ready"));
    expect(second.result.current.preview?.stops[0].title).toBe("Academy");
    expect(fetchOpenGeographiesPreview).toHaveBeenCalledTimes(1);
  });

  it("refreshes for everyone, skipping the cache", async () => {
    loadTour("https://og.example.org/a");
    const { result } = renderHook(() => useOpenGeographiesPreview());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    vi.mocked(fetchOpenGeographiesPreview).mockResolvedValue({
      ok: true,
      preview: preview("Dry Pond"),
    });
    act(() => result.current.refresh());
    await waitFor(() =>
      expect(result.current.preview?.stops[0].title).toBe("Dry Pond"),
    );
    expect(fetchOpenGeographiesPreview).toHaveBeenLastCalledWith(
      "ecds",
      7,
      true,
    );
  });

  it("ignores a response for a source that has since changed", async () => {
    let finishOld: (value: unknown) => void = () => {};
    vi.mocked(fetchOpenGeographiesPreview)
      .mockImplementationOnce(
        () => new Promise((resolve) => (finishOld = resolve)) as never,
      )
      .mockResolvedValue({ ok: true, preview: preview("New") });

    loadTour("https://og.example.org/old");
    const { result } = renderHook(() => useOpenGeographiesPreview());
    act(() => loadTour("https://og.example.org/new"));
    await waitFor(() =>
      expect(result.current.preview?.stops[0].title).toBe("New"),
    );

    await act(async () => finishOld({ ok: true, preview: preview("Old") }));
    expect(result.current.preview?.stops[0].title).toBe("New");
  });

  it("doesn't show one tour's preview on another", () => {
    useOpenGeographiesStore.setState({
      key: "ecds/7/https://og.example.org/a",
      status: "ready",
      preview: preview("Academy"),
    });
    loadTour("https://og.example.org/a", 8);
    const { result } = renderHook(() => useOpenGeographiesPreview());
    expect(result.current.preview).toBeUndefined();
  });
});
