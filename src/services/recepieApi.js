/**
 * Recipe API service
 */
import BaseApi from './baseApi';

// In-memory lists used by the UI (previously in Config.js)
export const ingredientListDB = {
    ingredient: [{ value: '', label: '', id: 0 }],
    category: [{ value: '', label: '', id: 0 }]
};

export const cuisineListDB = [{ value: '', label: '', id: 0 }];

export const cookingMethodListDB = [{ value: '', label: '', id: 0 }];

// Functions to fetch and populate the lists
export async function getCookingMethodList() {
    try {
        const response = await fetch(`${recipeApi.baseURL}/fooddata/cookingmethods`, {
            method: 'GET',
            headers: recipeApi.getHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        data.forEach(element => {
            cookingMethodListDB.push({ value: element.name, label: element.name, id: element.id });
        });
        console.log('Cooking methods were fetched from DB');
    } catch (error) {
        console.error('Error fetching cooking methods:', error);
    }
}

export async function getIngredientsList() {
    try {
        const response = await fetch(`${recipeApi.baseURL}/fooddata/ingredients`, {
            method: 'GET',
            headers: recipeApi.getHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        data.forEach(element => {
            ingredientListDB.ingredient.push({ value: element.name, label: element.name, id: element.id });
            ingredientListDB.category.push({ value: element.category, label: element.category, id: element.id });
        });
        console.log('Ingredients were fetched from DB');
    } catch (error) {
        console.error('Error fetching ingredients:', error);
    }
}

export async function getCuisineList() {
    try {
        const response = await fetch(`${recipeApi.baseURL}/fooddata/cuisines`, {
            method: 'GET',
            headers: recipeApi.getHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        data.forEach(element => {
            cuisineListDB.push({ value: element.name, label: element.name, id: element.id });
        });
        console.log('Cuisines were fetched from DB');
    } catch (error) {
        console.error('Error fetching cuisines:', error);
    }
}
class RecipeApi extends BaseApi {
    constructor() {
        super();
    }

    async createRecepie(recepieData) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId){
                throw new Error ('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/recipe/createRecipe`, {
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

    async getRecepie() {
        try {
            const userId = this.getCurrentUserId();
            if (!userId){
                throw new Error ('User not authenticated');
            }
            const headers = { ...this.getHeaders(), Accept: 'application/json' };
            const response = await fetch(`${this.baseURL}/recipe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });

            if (response.status === 204) return [];

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (Array.isArray(errorData.errors)) {
                    const errorMessages = errorData.errors.map(e => e.msg).join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting recepie: ', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const recipeApi = new RecipeApi();
export default recipeApi;


