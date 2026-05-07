import BaseApi from "./baseApi";

const FIELD_ALIAS_MAP = {
    username: "username",
    user_name: "username",
    userName: "username",
    first_name: "firstName",
    firstName: "firstName",
    firstname: "firstName",
    last_name: "lastName",
    lastName: "lastName",
    lastname: "lastName",
    email: "email",
    contact_number: "phone",
    contactNumber: "phone",
    phone: "phone",
    phone_number: "phone",
    address: "address",
    avatar: "avatar",
    image_url: "avatar",
    imageUrl: "avatar",
    user_image: "avatar",
    userImage: "avatar"
};

export class ProfileApi extends BaseApi {
    normalizeFieldKey(fieldName = "") {
        const normalized = String(fieldName || "").trim();
        return FIELD_ALIAS_MAP[normalized] || normalized;
    }

    pickMessage(value) {
        if (!value) return "";
        if (typeof value === "string") return value;
        if (typeof value === "number") return String(value);
        if (Array.isArray(value)) {
            const first = value.find((item) => item != null);
            return this.pickMessage(first);
        }
        if (typeof value === "object") {
            return (
                value.message ||
                value.msg ||
                value.error ||
                value.reason ||
                ""
            );
        }
        return "";
    }

    normalizeFieldErrors(payload = {}) {
        const normalized = {};
        const candidates = [payload.details, payload.errors, payload.fieldErrors].filter(Boolean);

        const saveFieldError = (fieldName, message) => {
            const key = this.normalizeFieldKey(fieldName);
            const text = this.pickMessage(message);
            if (!key || !text || normalized[key]) return;
            normalized[key] = text;
        };

        const walk = (node, fallbackField = "") => {
            if (!node) return;

            if (Array.isArray(node)) {
                node.forEach((item) => walk(item, fallbackField));
                return;
            }

            if (typeof node === "object") {
                if (node.field || node.path || node.param || node.key || node.name) {
                    const fieldName = node.field || node.path || node.param || node.key || node.name;
                    const message = node.message || node.msg || node.error || node.reason || node;
                    saveFieldError(fieldName, message);
                    return;
                }

                Object.entries(node).forEach(([key, value]) => {
                    if (["message", "error", "status", "code", "success"].includes(key)) return;
                    if (key === "details" || key === "errors" || key === "fieldErrors") {
                        walk(value, fallbackField);
                        return;
                    }
                    if (typeof value === "object" || Array.isArray(value)) {
                        walk(value, key);
                        return;
                    }
                    saveFieldError(key || fallbackField, value);
                });
                return;
            }

            if (fallbackField) {
                saveFieldError(fallbackField, node);
            }
        };

        candidates.forEach((candidate) => walk(candidate));
        return normalized;
    }

    extractProfile(payload) {
        if (!payload) return {};
        if (Array.isArray(payload)) return payload[0] || {};
        if (payload.profile && typeof payload.profile === "object") return payload.profile;
        if (payload.data && typeof payload.data === "object") {
            if (Array.isArray(payload.data)) return payload.data[0] || {};
            if (payload.data.profile && typeof payload.data.profile === "object") return payload.data.profile;
            return payload.data;
        }
        return payload;
    }

    async buildHttpError(response, fallbackMessage) {
        let payload = {};
        try {
            payload = await response.clone().json();
        } catch (_error) {
            payload = {};
        }

        const message =
            payload.error ||
            payload.message ||
            payload.detail ||
            fallbackMessage ||
            `Request failed (HTTP ${response.status})`;

        const error = new Error(message);
        error.status = response.status;
        error.payload = payload;
        error.details = payload.details;
        error.errors = payload.errors;
        error.fieldErrors = this.normalizeFieldErrors(payload);
        return error;
    }

    normalizeThrownError(error, fallbackMessage) {
        const rawMessage = String(error?.message || "");
        const isNetworkError =
            error?.name === "TypeError" || /Failed to fetch|NetworkError|Load failed/i.test(rawMessage);

        if (isNetworkError) {
            const networkError = new Error(
                "Cannot connect to backend API. Please make sure the backend server is running."
            );
            networkError.fieldErrors = {};
            networkError.cause = error;
            return networkError;
        }

        if (!error?.message) {
            const unknownError = new Error(fallbackMessage || "Unexpected profile API error.");
            unknownError.fieldErrors = {};
            return unknownError;
        }

        if (!error.fieldErrors) {
            error.fieldErrors = {};
        }
        return error;
    }

    /**
     * Fetch current user's profile data.
     * @returns {Promise<Object>} The profile object (first element of the response array)
     */
    async fetchProfile(tokenOverride) {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'GET',
                headers: this.getHeaders(tokenOverride)
            });

            if (!response.ok) {
                throw await this.buildHttpError(response, "Unable to load profile.");
            }

            const data = await response.json().catch(() => ({}));
            return this.extractProfile(data);
        } catch (error) {
            throw this.normalizeThrownError(error, "Unable to load profile.");
        }
    }

    /**
     * Update personal details for the authenticated user.
     * @param {Object} payload { name, first_name, last_name, contact_number, address }
     * @returns {Promise<Object>} The updated profile object
     */
    async updateProfile(payload, tokenOverride) {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'PUT',
                headers: this.getHeaders(tokenOverride),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw await this.buildHttpError(response, "Unable to save profile.");
            }

            const data = await response.json().catch(() => ({}));
            return this.extractProfile(data);
        } catch (error) {
            throw this.normalizeThrownError(error, "Unable to save profile.");
        }
    }
}

export const profileApi = new ProfileApi();
export default profileApi;
