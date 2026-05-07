// Shared base API utilities used by service classes
const RAW_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

const normalizeApiBaseURL = (baseURL, appendApiPath = true) => {
    const normalizedBase = String(baseURL || '').trim().replace(/\/+$/, '');
    if (!normalizedBase) return appendApiPath ? 'http://localhost:8081/api' : 'http://localhost:8081';
    if (!appendApiPath) return normalizedBase;
    if (/\/api(?:\/|$)/i.test(normalizedBase)) return normalizedBase;
    return `${normalizedBase}/api`;
};

const API_BASE_URL = normalizeApiBaseURL(RAW_API_BASE_URL, true);

const tryParseJson = (rawValue) => {
    if (!rawValue) return null;
    try {
        return JSON.parse(rawValue);
    } catch (_error) {
        return null;
    }
};

export class BaseApi {
    constructor(baseURL = API_BASE_URL, options = {}) {
        const shouldAppendApiPath =
            typeof options.appendApiPath === 'boolean'
                ? options.appendApiPath
                : baseURL === API_BASE_URL || baseURL === RAW_API_BASE_URL;

        this.baseURL = normalizeApiBaseURL(baseURL || RAW_API_BASE_URL, shouldAppendApiPath);
    }

    getCurrentUserId() {
        const storageKeys = [
            { storage: localStorage, key: 'user' },
            { storage: localStorage, key: 'user_session' },
            { storage: sessionStorage, key: 'user_session' },
            { storage: sessionStorage, key: 'user' }
        ];

        for (const { storage, key } of storageKeys) {
            const userData = tryParseJson(storage.getItem(key));
            if (!userData) continue;
            const userId = userData.user_id || userData.id || userData.uid || userData.sub;
            if (userId) return userId;
        }
        return null;
    }

    getAuthToken() {
        const directTokenKeys = [
            { storage: localStorage, key: 'auth_token' },
            { storage: localStorage, key: 'jwt_token' },
            { storage: localStorage, key: 'token' },
            { storage: sessionStorage, key: 'auth_token' },
            { storage: sessionStorage, key: 'jwt_token' },
            { storage: sessionStorage, key: 'token' }
        ];

        for (const { storage, key } of directTokenKeys) {
            const token = storage.getItem(key);
            if (token) return token;
        }

        const storageKeys = [
            { storage: localStorage, key: 'user' },
            { storage: localStorage, key: 'user_session' },
            { storage: sessionStorage, key: 'user_session' },
            { storage: sessionStorage, key: 'user' },
            { storage: localStorage, key: 'sso_session' },
            { storage: sessionStorage, key: 'sso_session' }
        ];

        for (const { storage, key } of storageKeys) {
            const userData = tryParseJson(storage.getItem(key));
            if (!userData) continue;
            const token =
                userData.token ||
                userData.jwt_token ||
                userData.auth_token ||
                userData.access_token;
            if (token) return token;
        }
        return null;
    }

    getHeaders(tokenOverride) {
        const token = tokenOverride || this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }
}

export default BaseApi;
