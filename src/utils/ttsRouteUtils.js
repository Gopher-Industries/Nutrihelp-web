const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/forgot",
  "/forgotpassword",
  "/mfa",
  "/mfaform",
  "/auth/callback",
];

/**
 * Match auth-like routes that should not show global TTS controls.
 * Includes wildcard handling for "/forgot*".
 */
export const isAuthPath = (pathname = "") => {
  const normalizedPath = String(pathname || "").toLowerCase();
  if (!normalizedPath.startsWith("/")) return false;

  return AUTH_ROUTE_PREFIXES.some((prefix) => {
    if (prefix === "/forgot") {
      return normalizedPath.startsWith("/forgot");
    }

    if (normalizedPath === prefix) return true;
    return normalizedPath.startsWith(`${prefix}/`);
  });
};

export { AUTH_ROUTE_PREFIXES };
