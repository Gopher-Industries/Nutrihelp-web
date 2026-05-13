import { isAuthPath } from "./ttsRouteUtils";

describe("ttsRouteUtils", () => {
  it("matches auth routes and forgot wildcard", () => {
    expect(isAuthPath("/login")).toBe(true);
    expect(isAuthPath("/signup")).toBe(true);
    expect(isAuthPath("/forgot")).toBe(true);
    expect(isAuthPath("/forgot/reset")).toBe(true);
    expect(isAuthPath("/forgotPassword")).toBe(true);
    expect(isAuthPath("/auth/callback")).toBe(true);
  });

  it("does not match application content routes", () => {
    expect(isAuthPath("/home")).toBe(false);
    expect(isAuthPath("/settings")).toBe(false);
    expect(isAuthPath("/meal")).toBe(false);
    expect(isAuthPath("/login-success")).toBe(false);
  });
});
