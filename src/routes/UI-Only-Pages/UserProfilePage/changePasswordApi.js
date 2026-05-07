const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081";
const VERIFY_ENDPOINT = `${API_BASE}/api/userpassword/verify`;
const UPDATE_ENDPOINT = `${API_BASE}/api/userpassword/update`;
const LEGACY_ENDPOINT = `${API_BASE}/api/userpassword`;

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return {};
  }
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const data = await parseJsonSafe(response);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

const buildHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Temporary compatibility layer: until dedicated verify/update endpoints are finalized,
// fallback to legacy PUT /api/userpassword endpoint.
export const verifyCurrentPassword = async ({ userId, currentPassword, token }) => {
  const payload = {
    user_id: userId,
    password: currentPassword,
  };

  const primary = await requestJson(VERIFY_ENDPOINT, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  if (primary.status !== 404 && primary.status !== 405) {
    return primary;
  }

  return requestJson(LEGACY_ENDPOINT, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify({
      user_id: userId,
      password: currentPassword,
      new_password: currentPassword,
    }),
  });
};

export const updatePassword = async ({
  userId,
  currentPassword,
  newPassword,
  token,
}) => {
  const payload = {
    user_id: userId,
    password: currentPassword,
    new_password: newPassword,
  };

  const primary = await requestJson(UPDATE_ENDPOINT, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });

  if (primary.status !== 404 && primary.status !== 405) {
    return primary;
  }

  return requestJson(LEGACY_ENDPOINT, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
};

export const changePasswordApi = {
  verifyCurrentPassword,
  updatePassword,
};
