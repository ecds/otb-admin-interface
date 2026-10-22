import { describe, it, expect } from "vitest";
import { returnToFrom, signInPath } from "./returnTo";

describe("signInPath", () => {
  it("remembers the page, query and hash", () => {
    expect(
      signInPath({
        pathname: "/ecds/tours/12",
        search: "?tab=map",
        hash: "#stops",
      }),
    ).toBe("/signin?return_to=%2Fecds%2Ftours%2F12%3Ftab%3Dmap%23stops");
  });

  it("doesn't bother remembering the home page", () => {
    expect(signInPath({ pathname: "/" })).toBe("/signin");
  });

  it("never sends someone back to the sign-in page", () => {
    expect(signInPath({ pathname: "/signin", search: "?return_to=%2Fx" })).toBe(
      "/signin",
    );
  });
});

describe("returnToFrom", () => {
  it("returns the remembered page", () => {
    expect(returnToFrom("?return_to=%2Fecds%2Ftours%2F12%3Ftab%3Dmap")).toBe(
      "/ecds/tours/12?tab=map",
    );
  });

  it("goes home without one", () => {
    expect(returnToFrom("")).toBe("/");
  });

  it("refuses anything that would leave the admin", () => {
    for (const target of [
      "https://evil.test/",
      "//evil.test/",
      "/\\evil.test/",
      "javascript:alert(1)",
      "ecds/tours",
    ])
      expect(returnToFrom(`?return_to=${encodeURIComponent(target)}`)).toBe(
        "/",
      );
  });

  it("won't loop back to the sign-in page", () => {
    expect(returnToFrom("?return_to=%2Fsignin%3Freturn_to%3D%252Fx")).toBe("/");
    expect(returnToFrom("?return_to=%2Fsignin")).toBe("/");
  });

  it("allows paths that merely start with 'signin'", () => {
    expect(returnToFrom("?return_to=%2Fsignin-help")).toBe("/signin-help");
  });
});
