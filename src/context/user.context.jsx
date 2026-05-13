import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://localhost:8443";
const DEFAULT_SESSION_TTL_MS = 180 * 60 * 1000;
const DEFAULT_PERSIST_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_BUFFER_MS = 60 * 1000;

export const UserContext = createContext({
  currentUser: null,
  authReady: false,
  setCurrentUser: () => {},
  logOut: async () => {},
  refreshSession: async () => null,
});

const KEYS = {
  localUser: "user",
  localExpiry: "expirationTime",
  sessionUser: "user_session",
  authToken: "auth_token",
  refreshToken: "refresh_token",
  jwtToken: "jwt_token",
  token: "token",
  ssoSession: "sso_session",
};

function safeParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function toPositiveNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function readRawUser(storage, key) {
  return safeParse(storage.getItem(key));
}

function readStoredUser() {
  const localUser = readRawUser(localStorage, KEYS.localUser);
  const sessionUser =
    readRawUser(sessionStorage, KEYS.sessionUser) ||
    readRawUser(localStorage, KEYS.sessionUser);

  const candidate = localUser || sessionUser;
  if (!candidate || typeof candidate !== "object") return null;

  const accessToken =
    candidate.accessToken ||
    candidate.token ||
    localStorage.getItem(KEYS.authToken) ||
    sessionStorage.getItem(KEYS.authToken) ||
    localStorage.getItem(KEYS.jwtToken) ||
    sessionStorage.getItem(KEYS.jwtToken) ||
    localStorage.getItem(KEYS.token) ||
    sessionStorage.getItem(KEYS.token) ||
    "";

  const refreshToken =
    candidate.refreshToken ||
    localStorage.getItem(KEYS.refreshToken) ||
    sessionStorage.getItem(KEYS.refreshToken) ||
    "";

  const sessionExpiresAt =
    toPositiveNumber(candidate.sessionExpiresAt) ||
    toPositiveNumber(localStorage.getItem(KEYS.localExpiry));

  if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
    return null;
  }

  return {
    ...candidate,
    token: accessToken,
    accessToken,
    refreshToken,
    tokenType: candidate.tokenType || "Bearer",
    expiresIn: toPositiveNumber(candidate.expiresIn),
    accessTokenExpiresAt: toPositiveNumber(candidate.accessTokenExpiresAt),
    sessionExpiresAt,
    rememberMe: Boolean(candidate.rememberMe || localUser),
  };
}

function clearLocalSession() {
  localStorage.removeItem(KEYS.localUser);
  localStorage.removeItem(KEYS.localExpiry);
  localStorage.removeItem(KEYS.authToken);
  localStorage.removeItem(KEYS.refreshToken);
  localStorage.removeItem(KEYS.jwtToken);
  localStorage.removeItem(KEYS.token);
}

function clearSessionSession() {
  sessionStorage.removeItem(KEYS.sessionUser);
  sessionStorage.removeItem(KEYS.authToken);
  sessionStorage.removeItem(KEYS.refreshToken);
  sessionStorage.removeItem(KEYS.jwtToken);
  sessionStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.sessionUser);
}

function clearAllSessionStorage() {
  clearLocalSession();
  clearSessionSession();
  localStorage.removeItem(KEYS.ssoSession);
  sessionStorage.removeItem(KEYS.ssoSession);
}

function writePersistentSession(user) {
  localStorage.setItem(KEYS.localUser, JSON.stringify(user));
  localStorage.setItem(KEYS.localExpiry, String(user.sessionExpiresAt || 0));
  localStorage.setItem(KEYS.sessionUser, JSON.stringify(user));
  localStorage.setItem(KEYS.authToken, user.token || "");
  if (user.refreshToken) {
    localStorage.setItem(KEYS.refreshToken, user.refreshToken);
  } else {
    localStorage.removeItem(KEYS.refreshToken);
  }

  sessionStorage.removeItem(KEYS.sessionUser);
  sessionStorage.removeItem(KEYS.authToken);
  sessionStorage.removeItem(KEYS.refreshToken);
}

function writeSessionOnly(user) {
  sessionStorage.setItem(KEYS.sessionUser, JSON.stringify(user));
  sessionStorage.setItem(KEYS.authToken, user.token || "");
  if (user.refreshToken) {
    sessionStorage.setItem(KEYS.refreshToken, user.refreshToken);
  } else {
    sessionStorage.removeItem(KEYS.refreshToken);
  }

  localStorage.removeItem(KEYS.localUser);
  localStorage.removeItem(KEYS.localExpiry);
  localStorage.removeItem(KEYS.authToken);
  localStorage.removeItem(KEYS.refreshToken);
  localStorage.removeItem(KEYS.jwtToken);
  localStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.sessionUser);
}

function normalizeSessionOptions(input, previousUser) {
  if (typeof input === "number") {
    return {
      persist: input > 0,
      sessionTtlMs: input > 0 ? input : DEFAULT_SESSION_TTL_MS,
    };
  }

  if (!input || typeof input !== "object") {
    return {
      persist: Boolean(previousUser?.rememberMe),
      sessionTtlMs:
        previousUser?.sessionExpiresAt
          ? Math.max(previousUser.sessionExpiresAt - Date.now(), 0)
          : previousUser?.rememberMe
            ? DEFAULT_PERSIST_TTL_MS
            : DEFAULT_SESSION_TTL_MS,
    };
  }

  return {
    persist:
      typeof input.persist === "boolean"
        ? input.persist
        : Boolean(input.rememberMe ?? previousUser?.rememberMe),
    sessionTtlMs: toPositiveNumber(input.sessionTtlMs || input.ttlMs),
    sessionExpiresAt: toPositiveNumber(input.sessionExpiresAt),
    accessToken: input.accessToken || input.token || "",
    refreshToken: input.refreshToken || "",
    tokenType: input.tokenType || "",
    expiresIn: toPositiveNumber(input.expiresIn),
    accessTokenExpiresAt: toPositiveNumber(input.accessTokenExpiresAt),
  };
}

function buildSessionUser(nextUser, options, previousUser) {
  const resolvedOptions = normalizeSessionOptions(options, previousUser);
  const merged = {
    ...(previousUser || {}),
    ...(nextUser || {}),
  };

  const accessToken =
    resolvedOptions.accessToken ||
    merged.accessToken ||
    merged.token ||
    previousUser?.accessToken ||
    previousUser?.token ||
    "";

  const refreshToken =
    resolvedOptions.refreshToken ||
    merged.refreshToken ||
    previousUser?.refreshToken ||
    "";

  const tokenType =
    resolvedOptions.tokenType ||
    merged.tokenType ||
    previousUser?.tokenType ||
    "Bearer";

  const expiresIn =
    resolvedOptions.expiresIn ||
    toPositiveNumber(merged.expiresIn) ||
    toPositiveNumber(previousUser?.expiresIn);

  const accessTokenExpiresAt =
    resolvedOptions.accessTokenExpiresAt ||
    toPositiveNumber(merged.accessTokenExpiresAt) ||
    (expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0) ||
    toPositiveNumber(previousUser?.accessTokenExpiresAt);

  const persist = resolvedOptions.persist;
  const sessionTtlMs =
    resolvedOptions.sessionTtlMs ||
    (persist ? DEFAULT_PERSIST_TTL_MS : DEFAULT_SESSION_TTL_MS);

  const sessionExpiresAt =
    resolvedOptions.sessionExpiresAt || Date.now() + sessionTtlMs;

  return {
    ...merged,
    token: accessToken,
    accessToken,
    refreshToken,
    tokenType,
    expiresIn,
    accessTokenExpiresAt,
    sessionExpiresAt,
    rememberMe: persist,
  };
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (_error) {
    return {};
  }
}

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(() => readStoredUser());
  const [authReady, setAuthReady] = useState(false);
  const currentUserRef = useRef(readStoredUser());
  const logoutTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const refreshPromiseRef = useRef(null);
  const refreshSessionRef = useRef(async () => null);

  const clearTimers = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const applyUserState = useCallback(
    (user) => {
      currentUserRef.current = user;
      setCurrentUserState(user);

      clearTimers();

      if (!user) {
        clearAllSessionStorage();
        return;
      }

      if (user.rememberMe) {
        writePersistentSession(user);
      } else {
        writeSessionOnly(user);
      }

      if (user.sessionExpiresAt > 0) {
        const delay = Math.max(0, user.sessionExpiresAt - Date.now());
        logoutTimerRef.current = setTimeout(() => {
          clearAllSessionStorage();
          currentUserRef.current = null;
          setCurrentUserState(null);
        }, delay);
      }
    },
    [clearTimers]
  );

  const scheduleRefresh = useCallback(
    (user) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (!user?.refreshToken || !user?.accessTokenExpiresAt) {
        return;
      }

      const refreshAt = Math.max(
        5000,
        user.accessTokenExpiresAt - Date.now() - REFRESH_BUFFER_MS
      );

      refreshTimerRef.current = setTimeout(() => {
        refreshSessionRef.current?.().catch(() => {});
      }, refreshAt);
    },
    []
  );

  const refreshSession = useCallback(async () => {
    const storedUser = currentUserRef.current || readStoredUser();
    if (!storedUser?.refreshToken) {
      return null;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedUser.refreshToken }),
      });

      const payload = await parseJsonSafe(response);
      const session = payload?.data?.session || payload?.session || {};

      if (!response.ok || !session?.accessToken) {
        throw new Error(payload?.error?.message || payload?.error || "Session refresh failed");
      }

      const refreshedUser = buildSessionUser(
        storedUser,
        {
          persist: storedUser.rememberMe,
          sessionTtlMs: storedUser.rememberMe
            ? DEFAULT_PERSIST_TTL_MS
            : DEFAULT_SESSION_TTL_MS,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken || storedUser.refreshToken,
          tokenType: session.tokenType,
          expiresIn: session.expiresIn,
        },
        storedUser
      );

      applyUserState(refreshedUser);
      scheduleRefresh(refreshedUser);
      return refreshedUser;
    })()
      .catch((error) => {
        applyUserState(null);
        throw error;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    return refreshPromiseRef.current;
  }, [applyUserState, scheduleRefresh]);

  useEffect(() => {
    refreshSessionRef.current = refreshSession;
  }, [refreshSession]);

  useEffect(() => {
    if (currentUserRef.current) {
      scheduleRefresh(currentUserRef.current);
    }
  }, [scheduleRefresh]);

  const logOut = useCallback(async () => {
    const storedUser = currentUserRef.current || readStoredUser();

    if (storedUser?.refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedUser.refreshToken }),
        });
      } catch (_error) {
        // Best-effort logout only.
      }
    }

    applyUserState(null);
  }, [applyUserState]);

  const verifyStoredSession = useCallback(async () => {
    const storedUser = readStoredUser();

    if (!storedUser?.token) {
      applyUserState(null);
      setAuthReady(true);
      return null;
    }

    const tryProfile = async (accessToken) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await parseJsonSafe(response);
      return { response, payload };
    };

    try {
      let activeUser = storedUser;
      let profileResult = await tryProfile(storedUser.token);

      if (profileResult.response.status === 401 && storedUser.refreshToken) {
        activeUser = await refreshSession();
        if (activeUser?.token) {
          profileResult = await tryProfile(activeUser.token);
        }
      }

      if (!profileResult.response.ok) {
        applyUserState(null);
        setAuthReady(true);
        return null;
      }

      const verifiedProfile = profileResult.payload?.data?.user || activeUser;
      const verifiedUser = buildSessionUser(verifiedProfile, activeUser, activeUser);
      applyUserState(verifiedUser);
      setAuthReady(true);
      return verifiedUser;
    } catch (_error) {
      applyUserState(null);
      setAuthReady(true);
      return null;
    }
  }, [applyUserState, refreshSession, scheduleRefresh]);

  useEffect(() => {
    verifyStoredSession();

    const onVisibilityRefresh = () => {
      if (document.visibilityState === "visible") {
        const storedUser = currentUserRef.current || readStoredUser();
        if (!storedUser?.token) return;

        if (
          storedUser.refreshToken &&
          storedUser.accessTokenExpiresAt &&
          storedUser.accessTokenExpiresAt - Date.now() <= REFRESH_BUFFER_MS
        ) {
          refreshSession().catch(() => {});
        }
      }
    };

    const onWindowFocus = () => {
      const storedUser = currentUserRef.current || readStoredUser();
      if (!storedUser?.token) return;

      if (
        storedUser.refreshToken &&
        storedUser.accessTokenExpiresAt &&
        storedUser.accessTokenExpiresAt - Date.now() <= REFRESH_BUFFER_MS
      ) {
        refreshSession().catch(() => {});
      }
    };

    const onStorage = () => {
      const storedUser = readStoredUser();
      currentUserRef.current = storedUser;
      setCurrentUserState(storedUser);
      if (storedUser) {
        clearTimers();
        if (storedUser.sessionExpiresAt > 0) {
          const delay = Math.max(0, storedUser.sessionExpiresAt - Date.now());
          logoutTimerRef.current = setTimeout(() => {
            clearAllSessionStorage();
            currentUserRef.current = null;
            setCurrentUserState(null);
          }, delay);
        }
        scheduleRefresh(storedUser);
      } else {
        clearTimers();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityRefresh);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("storage", onStorage);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityRefresh);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("storage", onStorage);
      clearTimers();
    };
  }, [clearTimers, refreshSession, scheduleRefresh, verifyStoredSession]);

  const setCurrentUser = useCallback(
    (userOrUpdater, options = 0) => {
      const previousUser = currentUserRef.current;
      const nextUser =
        typeof userOrUpdater === "function"
          ? userOrUpdater(previousUser)
          : userOrUpdater;

      if (!nextUser) {
        applyUserState(null);
        setAuthReady(true);
        return;
      }

      const sessionUser = buildSessionUser(nextUser, options, previousUser);
      applyUserState(sessionUser);
      scheduleRefresh(sessionUser);
      setAuthReady(true);
    },
    [applyUserState, scheduleRefresh]
  );

  const value = useMemo(
    () => ({
      currentUser,
      authReady,
      setCurrentUser,
      logOut,
      refreshSession,
    }),
    [authReady, currentUser, logOut, refreshSession, setCurrentUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
