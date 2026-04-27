import BaseApi from "./baseApi";

class AssistantApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "AssistantApiError";
    this.status = status;
    this.payload = payload;
  }
}

const CHATBOT_BASE_PATH = "/chatbot";

class AssistantApi extends BaseApi {
  async request(path, options = {}) {
    const response = await fetch(`${this.baseURL}${CHATBOT_BASE_PATH}${path}`, {
      method: options.method || "GET",
      headers: this.getHeaders(options.tokenOverride),
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.detail ||
        payload?.message ||
        payload?.error ||
        payload?.msg ||
        "Assistant request failed.";
      throw new AssistantApiError(message, { status: response.status, payload });
    }

    return payload;
  }

  async query({ userId, query }) {
    return this.request("/query", {
      method: "POST",
      body: {
        user_id: userId,
        query
      }
    });
  }

  async history({ userId }) {
    return this.request("/history", {
      method: "POST",
      body: {
        user_id: userId
      }
    });
  }

  async clearHistory({ userId }) {
    return this.request("/history", {
      method: "DELETE",
      body: {
        user_id: userId
      }
    });
  }
}

export const assistantApi = new AssistantApi();
export { AssistantApiError };

