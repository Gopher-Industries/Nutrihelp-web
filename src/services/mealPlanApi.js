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
}

export const mealPlanApi = new MealPlanApi();
export default mealPlanApi;