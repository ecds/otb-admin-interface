import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import RetryingImage from "./RetryingImage";

const img = () => screen.getByRole("img") as HTMLImageElement;
const fail = async (ms: number) => {
  fireEvent.error(img());
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
};

describe("RetryingImage", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the original URL first", () => {
    render(<RetryingImage src="/m.jpg?variant=mobile" alt="thumb" />);
    expect(img().getAttribute("src")).toBe("/m.jpg?variant=mobile");
  });

  it("retries with a cache-busting param after a backoff delay", async () => {
    render(<RetryingImage src="/m.jpg?variant=mobile" alt="thumb" />);
    fireEvent.error(img());
    await act(async () => {
      vi.advanceTimersByTime(999);
    });
    expect(img().getAttribute("src")).toBe("/m.jpg?variant=mobile");
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(img().getAttribute("src")).toBe("/m.jpg?variant=mobile&retry=1");
    await fail(2000);
    expect(img().getAttribute("src")).toBe("/m.jpg?variant=mobile&retry=2");
  });

  it("uses ? for URLs without a query string", async () => {
    render(<RetryingImage src="/m.jpg" alt="thumb" />);
    await fail(1000);
    expect(img().getAttribute("src")).toBe("/m.jpg?retry=1");
  });

  it("shows a placeholder after running out of retries", async () => {
    render(<RetryingImage src="/m.jpg" alt="thumb" maxRetries={2} />);
    await fail(1000);
    await fail(2000);
    fireEvent.error(img());
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/processing image/i)).toBeInTheDocument();
  });

  it("starts over when the source changes", async () => {
    const { rerender } = render(<RetryingImage src="/a.jpg" alt="thumb" />);
    await fail(1000);
    rerender(<RetryingImage src="/b.jpg" alt="thumb" />);
    expect(img().getAttribute("src")).toBe("/b.jpg");
  });
});
