import { FaRegCalendarAlt } from "react-icons/fa";

const CreateMealModal = ({ show, onClose, selectedRecipes, setSelectedRecipes, onCreateMeal }) => {
    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onCreateMeal({
            mealName: formData.get('mealName'),
            mealTime: formData.get('mealTime'),
            plannedDate: formData.get('plannedDate')
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-5xl shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Create a Meal</h3>
                <p className="text-gray-700 text-center mb-6">Combine recipes from our library to create your perfect meal.</p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Meal Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                            <input
                                name="mealName" 
                                type="text"
                                placeholder="e.g., Healthy Power Lunch"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                            <select name="mealTime" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                                <option value="">Select Meal Time</option>
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snacks">Snacks</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Planned Date</label>
                            <div className="relative">
                                <input
                                    name="plannedDate" 
                                    type="date"
                                    id="mealPlannedDate"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <style jsx>{`
                                    #mealPlannedDate::-webkit-calendar-picker-indicator {
                                        display: none;
                                    }
                                `}</style>
                                {/* Customizable calendar icons */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('mealPlannedDate');
                                        if (input) {
                                            input.focus();
                                            input.showPicker();
                                        }
                                    }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto z-10"
                                >
                                    <FaRegCalendarAlt className="text-gray-400 h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Recipe Selection Area */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-4">Select Recipes</h4>
                        <div className="flex gap-6 h-80">
                            {/* Left - Available Recipes */}
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-3">
                                    <h5 className="text-sm font-medium text-gray-700">Available Recipes</h5>
                                    <div className="flex gap-2">
                                        <button type="button" className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">Platform</button>
                                        <button type="button" className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded">My Recipes</button>
                                    </div>
                                </div>
                                <div className="h-72 overflow-y-auto border rounded p-3 space-y-2">
                                    {/* Simulated recipe library */}
                                    {[
                                        { id: 1, name: 'Grilled Chicken Breast', type: 'Main', calories: 280, carbs: 0, protein: 53, fat: 6, source: 'Platform' },
                                        { id: 2, name: 'Quinoa Salad', type: 'Side', calories: 222, carbs: 39, protein: 8, fat: 4, source: 'Platform' },
                                        { id: 3, name: 'Steamed Broccoli', type: 'Vegetable', calories: 55, carbs: 11, protein: 4, fat: 0, source: 'Platform' },
                                        { id: 4, name: 'Greek Yogurt', type: 'Dairy', calories: 150, carbs: 9, protein: 20, fat: 4, source: 'Platform' },
                                        { id: 5, name: 'My Special Sauce', type: 'Sauce', calories: 80, carbs: 5, protein: 1, fat: 6, source: 'My Recipes' },
                                        { id: 6, name: 'Avocado Toast', type: 'Main', calories: 290, carbs: 32, protein: 7, fat: 16, source: 'My Recipes' },
                                    ].map((recipe) => (
                                        <div key={recipe.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded border">
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium">{recipe.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {recipe.type} • {recipe.calories} kcal • C{recipe.carbs}g P{recipe.protein}g F{recipe.fat}g
                                                        </div>
                                                    </div>
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{recipe.source}</span>
                                                </div>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    if (!selectedRecipes.find(r => r.id === recipe.id)) {
                                                        setSelectedRecipes([...selectedRecipes, recipe]);
                                                    }
                                                }}
                                                className="ml-3 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                                disabled={selectedRecipes.find(r => r.id === recipe.id)}
                                            >
                                                {selectedRecipes.find(r => r.id === recipe.id) ? 'Added' : 'Add'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Right - Selected Recipes for Meal */}
                            <div className="flex-1">
                                <h5 className="text-sm font-medium text-gray-700 mb-3">Recipes in This Meal</h5>
                                <div className="h-72 overflow-y-auto border rounded p-3 bg-gray-50">
                                    {selectedRecipes.length === 0 ? (
                                        <div className="text-center text-gray-400 py-12">
                                            <p>Add recipes to build your meal</p>
                                            <p className="text-sm mt-2">Click "Add" from the left to include recipes</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedRecipes.map((recipe) => (
                                                <div key={recipe.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{recipe.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {recipe.type} • {recipe.calories} kcal • C{recipe.carbs}g P{recipe.protein}g F{recipe.fat}g
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipe.id));
                                                        }}
                                                        className="ml-3 px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Nutritional Summary */}
                    <div className="border rounded-lg p-4 bg-purple-50">
                        <h4 className="font-semibold text-purple-900 mb-3">Meal Nutritional Summary</h4>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Calories</div>
                                <div className="text-lg font-bold text-purple-900">
                                    {selectedRecipes.reduce((sum, recipe) => sum + recipe.calories, 0)}
                                </div>
                                <div className="text-xs text-gray-500">kcal</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Carbs</div>
                                <div className="text-lg font-bold text-green-600">
                                    {selectedRecipes.reduce((sum, recipe) => sum + recipe.carbs, 0)}
                                </div>
                                <div className="text-xs text-gray-500">g</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Protein</div>
                                <div className="text-lg font-bold text-yellow-600">
                                    {selectedRecipes.reduce((sum, recipe) => sum + recipe.protein, 0)}
                                </div>
                                <div className="text-xs text-gray-500">g</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Fat</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {selectedRecipes.reduce((sum, recipe) => sum + recipe.fat, 0)}
                                </div>
                                <div className="text-xs text-gray-500">g</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Sugar</div>
                                <div className="text-lg font-bold text-orange-600">0</div>
                                <div className="text-xs text-gray-500">g</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Fiber</div>
                                <div className="text-lg font-bold text-cyan-600">0</div>
                                <div className="text-xs text-gray-500">g</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Sodium</div>
                                <div className="text-lg font-bold text-pink-600">0</div>
                                <div className="text-xs text-gray-500">mg</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-600">Cholesterol</div>
                                <div className="text-lg font-bold text-red-600">0</div>
                                <div className="text-xs text-gray-500">mg</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Optional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meal Notes (Optional)</label>
                        <textarea
                            placeholder="Add any special instructions, dietary considerations, or preferences..."
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        ></textarea>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                            Save Meal to Plan
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                setSelectedRecipes([]);
                                onClose();
                            }}
                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateMealModal;