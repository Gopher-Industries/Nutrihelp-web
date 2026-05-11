import BaseApi from "./baseApi";

const api = new BaseApi();

async function requestJson(path, options = {}) {
  const response = await fetch(`${api.baseURL}${path}`, {
    method: options.method || "GET",
    headers: {
      ...api.getHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || data?.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function fetchMyNotifications(limit = 20) {
  const userId = api.getCurrentUserId();
  if (!userId) return { items: [], unreadCount: 0 };
  const data = await requestJson(`/notifications/${userId}?limit=${limit}`);
  const rawItems = data?.data?.items || data?.items || [];
  const items = rawItems
    .filter((item) => item?.type !== "recipe_community_request" && item?.type !== "recipe_community_private")
    .map((item) => ({
      ...item,
      content: String(item?.content || "").replace(/\s*recipe_id:\d+;state:[a-z_]+;title:.+$/i, "").trim(),
    }));
  return {
    items,
    unreadCount: data?.meta?.unreadCount ?? data?.unreadCount ?? 0,
  };
}

export async function markMyNotificationsRead() {
  const userId = api.getCurrentUserId();
  if (!userId) return { items: [] };
  try {
    return await requestJson(`/notifications/${userId}/read-all`, { method: "POST" });
  } catch (error) {
    const message = String(error?.message || "");
    if (message.includes("No unread notifications") || message.includes("NOTIFICATIONS_EMPTY")) {
      return { items: [], meta: { count: 0 } };
    }
    throw error;
  }
}
