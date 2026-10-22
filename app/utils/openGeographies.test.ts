import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./requests", () => ({ request: vi.fn() }));

import { request } from "./requests";
import { fetchOpenGeographiesPreview } from "./openGeographies";

type Result = Awaited<ReturnType<typeof request>>;

describe("fetchOpenGeographiesPreview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("asks the API for the tour's preview, skipping the cache on refresh", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: true },
      data: { stops: [] },
    } as unknown as Result);
    await fetchOpenGeographiesPreview("ecds", 7);
    await fetchOpenGeographiesPreview("ecds", 7, true);
    expect(
      vi.mocked(request).mock.calls.map(([options]) => options.path),
    ).toEqual([
      "ecds/v4/admin/tours/7/open_geographies",
      "ecds/v4/admin/tours/7/open_geographies?refresh=true",
    ]);
  });

  it("checks an unsaved URL", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: true },
      data: { stops: [] },
    } as unknown as Result);
    await fetchOpenGeographiesPreview(
      "ecds",
      7,
      true,
      "https://og.example.org/t?x=1",
    );
    expect(vi.mocked(request).mock.calls[0][0].path).toBe(
      "ecds/v4/admin/tours/7/open_geographies?refresh=true&url=https%3A%2F%2Fog.example.org%2Ft%3Fx%3D1",
    );
  });

  it("passes on the API's explanation when it can't preview", async () => {
    vi.mocked(request).mockResolvedValue({
      response: { ok: false },
      data: { error: "Open Geographies responded with 503." },
    } as unknown as Result);
    expect(await fetchOpenGeographiesPreview("ecds", 7)).toEqual({
      ok: false,
      error: "Open Geographies responded with 503.",
    });
  });
});
