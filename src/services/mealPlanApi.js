import BaseApi from './baseApi';

class MealPlanApi extends BaseApi {
    constructor() {
        super();
    }
    async getMealPlans() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }
            const response = await fetch(`${this.baseURL}/mealplan?user_id=${userId}`, {
                method: 'GET',
                headers: {
                    ...this.getHeaders(),
                    'X-User-Id': userId
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.meal_plans || [];
        } catch (error) {
            console.error('Error fetching meal plans:', error);
            throw error;
        }
    }
    async saveMealPlan(mealType, recipeIds) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/mealplan`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    user_id: userId,
                    meal_type: mealType,
                    recipe_ids: recipeIds || []
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error saving meal plan for ${mealType}:`, error);
            throw error;
        }
    }
    async deleteMealPlan(mealPlanId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/mealplan`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    user_id: userId,
                    meal_plan_id: mealPlanId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting meal plan:', error);
            throw error;
        }
    }

    async saveAiMealSuggestion(meal) {
        if (!this.getAuthToken()) {
            const err = new Error('Please log in to save meals to your plan.');
            err.status = 401;
            throw err;
        }
        const url = `${this.baseURL}/mealplan/ai-suggestion`;
        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(meal)
            });
        } catch (networkErr) {
            console.error('[saveAiMealSuggestion] Network error:', networkErr);
            const err = new Error('Could not connect to server.');
            err.status = 0;
            throw err;
        }
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            console.error('[saveAiMealSuggestion] HTTP', response.status, 'from', url, body);
            if (response.status === 401) {
                const err = new Error('Please log in to save meals to your plan.');
                err.status = 401;
                throw err;
            }
            if (response.status === 429) {
                const until = body.blockedUntil ? new Date(body.blockedUntil).toLocaleTimeString() : null;
                const message = until
                    ? `Too many requests — try again after ${until}.`
                    : (body.error || 'Too many requests. Please wait a moment and try again.');
                const err = new Error(message);
                err.status = 429;
                throw err;
            }
            const message = body.message || body.error || body.detail || body.msg
                || (response.status === 400 ? 'Validation error. Please check your input.' : 'Something went wrong, please try again.');
            const err = new Error(message);
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }

    async getAiMealSuggestions() {
        if (!this.getAuthToken()) {
            const err = new Error('User not authenticated');
            err.status = 401;
            throw err;
        }
        const url = `${this.baseURL}/mealplan/ai-suggestion`;
        let response;
        try {
            response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
        } catch (networkErr) {
            console.error('[getAiMealSuggestions] Network error:', networkErr);
            const err = new Error('Could not connect to server.');
            err.status = 0;
            throw err;
        }
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            console.error('[getAiMealSuggestions] HTTP', response.status, 'from', url, body);
            if (response.status === 401) {
                const err = new Error('Session expired. Please log in again.');
                err.status = 401;
                throw err;
            }
            if (response.status === 429) {
                const until = body.blockedUntil ? new Date(body.blockedUntil).toLocaleTimeString() : null;
                const message = until
                    ? `Too many requests — try again after ${until}.`
                    : (body.error || 'Too many requests. Please wait a moment and try again.');
                const err = new Error(message);
                err.status = 429;
                throw err;
            }
            const message = body.message || body.error || body.detail || body.msg || 'Something went wrong, please try again.';
            const err = new Error(message);
            err.status = response.status;
            throw err;
        }
        const data = await response.json();
        return data.data?.items || [];
    }

    async deleteAiMealSuggestion(id) {
        if (!this.getAuthToken()) {
            const err = new Error('User not authenticated');
            err.status = 401;
            throw err;
        }
        const url = `${this.baseURL}/mealplan/ai-suggestion`;
        let response;
        try {
            response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({ id })
            });
        } catch (networkErr) {
            console.error('[deleteAiMealSuggestion] Network error:', networkErr);
            const err = new Error('Could not connect to server.');
            err.status = 0;
            throw err;
        }
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            console.error('[deleteAiMealSuggestion] HTTP', response.status, 'from', url, body);
            if (response.status === 401) {
                const err = new Error('Session expired. Please log in again.');
                err.status = 401;
                throw err;
            }
            if (response.status === 429) {
                const until = body.blockedUntil ? new Date(body.blockedUntil).toLocaleTimeString() : null;
                const message = until
                    ? `Too many requests — try again after ${until}.`
                    : (body.error || 'Too many requests. Please wait a moment and try again.');
                const err = new Error(message);
                err.status = 429;
                throw err;
            }
            const message = body.message || body.error || body.detail || body.msg || 'Something went wrong, please try again.';
            const err = new Error(message);
            err.status = response.status;
            throw err;
        }
        return await response.json();
    }
}

export const mealPlanApi = new MealPlanApi();
export default mealPlanApi;