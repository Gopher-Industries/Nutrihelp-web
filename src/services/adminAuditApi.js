import BaseApi from "./baseApi";

function isLocalDevAuditMode() {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function getLocalDevBaseURL() {
  if (typeof window === "undefined") {
    return "https://localhost:8443/api";
  }

  const host = window.location.hostname || "localhost";
  return `https://${host}:8443/api`;
}

class AdminAuditApi extends BaseApi {
  async getOverview() {
    return this.getLiveOverview();
  }

  async getLiveOverview() {
    const useDevLocalEndpoint = isLocalDevAuditMode();
    const token = useDevLocalEndpoint ? null : this.getAuthToken();
    const baseURL = useDevLocalEndpoint ? getLocalDevBaseURL() : this.baseURL;
    const endpoint = useDevLocalEndpoint
      ? `${baseURL}/system/dev/live-audit/overview`
      : `${baseURL}/system/live-audit/overview`;
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      headers,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error || "Failed to load integration audit overview");
    }

    return {
      ...payload.data,
      __debug: {
        endpoint,
        mode: useDevLocalEndpoint ? "dev-live" : "authenticated-live",
      },
    };
  }

  async refreshLiveOverview() {
    const useDevLocalEndpoint = isLocalDevAuditMode();

    if (useDevLocalEndpoint) {
      const baseURL = getLocalDevBaseURL();
      const endpoint = `${baseURL}/system/dev/live-audit/run`;
      const response = await fetch(endpoint, {
        method: "POST",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || "Failed to refresh live integration audit overview");
      }

      return {
        ...payload.data,
        __debug: {
          endpoint,
          mode: "dev-live-refresh",
        },
      };
    }

    const token = this.getAuthToken();
    const endpoint = `${this.baseURL}/system/live-audit/run`;
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error || "Failed to refresh live integration audit overview");
    }

    return {
      ...payload.data,
      __debug: {
        endpoint,
        mode: "authenticated-live-refresh",
      },
    };
  }
}

export const adminAuditApi = new AdminAuditApi();
export default adminAuditApi;
