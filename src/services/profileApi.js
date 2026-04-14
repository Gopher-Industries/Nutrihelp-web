import BaseApi from "./baseApi";

export class ProfileApi extends BaseApi {
    /**
     * Fetch current user's profile data.
     * @returns {Promise<Object>} The profile object (first element of the response array)
     */
    async fetchProfile() {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch profile (HTTP ${response.status})`);
            }

            const data = await response.json();
            // The API returns an array, we must access the first element
            if (Array.isArray(data) && data.length > 0) {
                return data[0];
            }
            return data;
        } catch (error) {
            console.error("ProfileApi.fetchProfile error:", error);
            throw error;
        }
    }

    /**
     * Update personal details for the authenticated user.
     * @param {Object} payload { name, first_name, last_name, contact_number, address }
     * @returns {Promise<Object>} The updated profile object
     */
    async updateProfile(payload) {
        try {
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.error || "Failed to update profile");
                error.details = errorData.details || []; // For inline error mapping
                error.status = response.status;
                throw error;
            }

            const data = await response.json();
            return Array.isArray(data) ? data[0] : data;
        } catch (error) {
            console.error("ProfileApi.updateProfile error:", error);
            throw error;
        }
    }
}

export const profileApi = new ProfileApi();
export default profileApi;