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

const normalizeLookupRows = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.cuisines)) return data.cuisines;
    if (Array.isArray(data?.ingredients)) return data.ingredients;
    if (Array.isArray(data?.cookingMethods)) return data.cookingMethods;
    return [];
};

// Functions to fetch and populate the lists
export async function getCookingMethodList() {
    try {
        const response = await fetch(`${recipeApi.baseURL}/fooddata/cookingmethods`, {
            method: 'GET',
            headers: recipeApi.getHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const mapped = normalizeLookupRows(data).map(element => ({
            value: element.name,
            label: element.name,
            id: element.id
        }));
        cookingMethodListDB.splice(0, cookingMethodListDB.length, { value: '', label: '', id: 0 }, ...mapped);
        console.log('Cooking methods were fetched from DB');
        return [...cookingMethodListDB];
    } catch (error) {
        console.error('Error fetching cooking methods:', error);
        return [...cookingMethodListDB];
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
        const rows = normalizeLookupRows(data);
        ingredientListDB.ingredient.splice(
            0,
            ingredientListDB.ingredient.length,
            { value: '', label: '', id: 0 },
            ...rows.map(element => ({ value: element.name, label: element.name, id: element.id }))
        );
        ingredientListDB.category.splice(
            0,
            ingredientListDB.category.length,
            { value: '', label: '', id: 0 },
            ...rows.map(element => ({ value: element.category, label: element.category, id: element.id }))
        );
        console.log('Ingredients were fetched from DB');
        return {
            ingredient: [...ingredientListDB.ingredient],
            category: [...ingredientListDB.category]
        };
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        return {
            ingredient: [...ingredientListDB.ingredient],
            category: [...ingredientListDB.category]
        };
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
        const mapped = normalizeLookupRows(data).map(element => ({
            value: element.name,
            label: element.name,
            id: element.id
        }));
        cuisineListDB.splice(0, cuisineListDB.length, { value: '', label: '', id: 0 }, ...mapped);
        console.log('Cuisines were fetched from DB');
        return [...cuisineListDB];
    } catch (error) {
        console.error('Error fetching cuisines:', error);
        return [...cuisineListDB];
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
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const headers = { ...this.getHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' };
            const response = await fetch(`${this.baseURL}/recipe`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ user_id: userId })
            });
            // to trouble shoot and debug
            // console.log('GET /recipe response (status, ok, type):', response.status, response.ok, typeof response.status);
            // console.log('response headers:', Array.from(response.headers.entries()));
            // console.log('content-length header:', response.headers.get('content-length'));

            if (response.status === 204 || response.status === 404 || response.headers.get('content-length') === '0') {
                return [];
            }

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                const errorData = data || {};
                if (Array.isArray(errorData.errors)) {
                    const errorMessages = errorData.errors.map(e => e.msg).join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // backend returns { message, statusCode, recipes: [...] }
            return data && Array.isArray(data.recipes) ? data.recipes : (data || []);
        } catch (error) {
            console.error('Error getting recepie: ', error);
            throw error;
        }
    }

    async deleteRecepie(recipeId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/recipe`, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    user_id: userId,
                    recipe_id: recipeId
                })
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error || `HTTP error! status: ${response.status}`);
            }

            return data || { message: 'success' };
        } catch (error) {
            console.error('Error deleting recepie: ', error);
            throw error;
        }
    }

    async shareToCommunity(recipeId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/recipe/${recipeId}/share-community`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ user_id: userId })
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error || `HTTP error! status: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error('Error sharing recipe to community: ', error);
            throw error;
        }
    }

    async unshareFromCommunity(recipeId) {
        try {
            const userId = this.getCurrentUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch(`${this.baseURL}/recipe/${recipeId}/unshare-community`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ user_id: userId })
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error || `HTTP error! status: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error('Error stopping community sharing: ', error);
            throw error;
        }
    }

    async getCommunityRecipes(limit = 300) {
        try {
            const response = await fetch(`${this.baseURL}/recipe/community?limit=${limit}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(data?.error || `HTTP error! status: ${response.status}`);
            }
            if (Array.isArray(data?.recipes)) return data.recipes;
            if (Array.isArray(data?.data?.recipes)) return data.data.recipes;
            return [];
        } catch (error) {
            console.error('Error getting community recipes: ', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const recipeApi = new RecipeApi();
export default recipeApi;
