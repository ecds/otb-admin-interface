import { describe, it, expect } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("returns the fallback when data is undefined", () => {
    expect(getErrorMessage(undefined, "Something went wrong")).toBe(
      "Something went wrong",
    );
  });

  it("returns the fallback when data has no errors", () => {
    expect(getErrorMessage({}, "fallback")).toBe("fallback");
  });

  it("returns the fallback when errors array is empty", () => {
    expect(getErrorMessage({ errors: [] }, "fallback")).toBe("fallback");
  });

  it("handles { error: 'message' } singular shape", () => {
    expect(getErrorMessage({ error: "Not found" }, "fallback")).toBe(
      "Not found",
    );
  });

  it("handles { errors: ['message'] } plain-string array", () => {
    expect(getErrorMessage({ errors: ["Bad request"] }, "fallback")).toBe(
      "Bad request",
    );
  });

  it("handles { errors: [{ detail }] } Rails validation shape", () => {
    expect(
      getErrorMessage({ errors: [{ detail: "Title can't be blank" }] }, "fallback"),
    ).toBe("Title can't be blank");
  });

  it("joins multiple error details with a space", () => {
    expect(
      getErrorMessage(
        { errors: [{ detail: "Title can't be blank" }, { detail: "Lat is invalid" }] },
        "fallback",
      ),
    ).toBe("Title can't be blank Lat is invalid");
  });

  it("skips entries with no detail and no string value", () => {
    expect(
      getErrorMessage({ errors: [{ detail: undefined }, { detail: "Valid" }] }, "fallback"),
    ).toBe("Valid");
  });

  it("prefers errors array over singular error key", () => {
    expect(
      getErrorMessage(
        { error: "singular", errors: [{ detail: "array wins" }] },
        "fallback",
      ),
    ).toBe("array wins");
  });
});
