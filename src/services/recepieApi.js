/**
 * API Service for managing user appointments
 * Connects to the appointment backend endpoints
 */
const API_BASE_URL = 'http://localhost:80/api';

class RecipeApi {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get current user ID from localStorage
     * @returns {string|null} User ID or null if not found
     */
    getCurrentUserId() {
        // Check multiple storage locations used by the app
        const storageKeys = [
            { storage: localStorage, key: 'user' },
            { storage: localStorage, key: 'user_session' },
            { storage: sessionStorage, key: 'user_session' }
        ];

        for (const { storage, key } of storageKeys) {
            const data = storage.getItem(key);
            if (data) {
                try {
                    const userData = JSON.parse(data);
                    // Check various possible user ID field names
                    const userId = userData.user_id || userData.id || userData.uid || userData.sub;
                    if (userId) return userId;
                } catch (error) {
                    console.error(`Error parsing ${key}:`, error);
                }
            }
        }
        return null;
    }

    /**
     * Get authentication token from localStorage
     * @returns {string|null} JWT token or null if not found
     */
    getAuthToken() {
        // Check for dedicated token storage first
        const authToken = localStorage.getItem('auth_token');
        if (authToken) return authToken;

        // Check user session objects
        const storageKeys = [
            { storage: localStorage, key: 'user' },
            { storage: localStorage, key: 'user_session' },
            { storage: sessionStorage, key: 'user_session' }
        ];

        for (const { storage, key } of storageKeys) {
            const data = storage.getItem(key);
            if (data) {
                try {
                    const userData = JSON.parse(data);
                    if (userData.token) return userData.token;
                } catch (error) {
                    console.error(`Error parsing ${key}:`, error);
                }
            }
        }
        return null;
    }

    /**
     * Get default headers for API requests
     * @returns {Object} Headers object
     */
    getHeaders() {
        const token = this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async createRecepie(recepieData) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId){
                throw new Error ('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/createRecepie`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    userId,
                    ...recepieData
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.errors) {
                    // Handle validation errors from express-validator
                    const errorMessages = errorData.errors.map(e => e.msg).join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        }    
        catch(error)
        {
            console.error('Error creating recepie: ', error)
            throw error;
        }
    }
}

// Export a singleton instance
const RecipeObj = new RecipeApi();
export default RecipeObj;
