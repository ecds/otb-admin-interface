import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls the callback after the wait period", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced("a");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("resets the timer on each call, firing only once", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced("a");
    vi.advanceTimersByTime(100);
    debounced("b");
    vi.advanceTimersByTime(100);
    debounced("c");
    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("fires again after the wait period following the last call", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(100);
    debounced("second");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, "first");
    expect(fn).toHaveBeenNthCalledWith(2, "second");
  });

  it("passes multiple arguments through", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced(1, 2, 3);
    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledWith(1, 2, 3);
  });
});
