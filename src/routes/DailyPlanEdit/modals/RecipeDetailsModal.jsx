import React from "react";

const RecipeDetailsModal = ({ show, onClose, recipe, recipeDescriptions, onAddRecipe }) => {
    if (!show || !recipe) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">{recipe.name}</h3>
                <div className="mb-4">
                    <img src={recipe.img} alt={recipe.name} className="w-full h-48 object-cover rounded-lg" />
                </div>
                <p className="text-gray-700 mb-6">{recipeDescriptions[recipe.name] || "Detailed recipe information coming soon!"}</p>
                
                <div className="mb-6">
                    <h4 className="font-bold text-purple-900 mb-3">Nutritional Information</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-green-600">Carbohydrates</span>
                            <span className="text-gray-600">32g</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-green-500" style={{ width: '80%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-blue-600">Fat</span>
                            <span className="text-gray-600">8g</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-blue-500" style={{ width: '53%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-yellow-600">Protein</span>
                            <span className="text-gray-600">12g</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-yellow-500" style={{ width: '60%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-orange-600">Sugar</span>
                            <span className="text-gray-600">5g</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-orange-500" style={{ width: '50%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-cyan-600">Fiber</span>
                            <span className="text-gray-600">4g</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-cyan-500" style={{ width: '50%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-pink-600">Sodium</span>
                            <span className="text-gray-600">320mg</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-pink-500" style={{ width: '53%' }}></div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-red-600">Cholesterol</span>
                            <span className="text-gray-600">15mg</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded">
                            <div className="h-2 rounded bg-red-500" style={{ width: '25%' }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => onAddRecipe(recipe.name)}
                        className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        Add to Meal Plan
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailsModal;