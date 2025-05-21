
import { FaRegCalendarAlt } from "react-icons/fa";

const CopyMealModal = ({ 
    show, 
    onClose, 
    copyMealDate, 
    setCopyMealDate, 
    selectedCopyMeals, 
    setSelectedCopyMeals, 
    getMealsForDate,
    onCopyMeals
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Copy Previous Meal</h3>
                <p className="text-gray-700 text-center mb-6">Select a date and copy meals from your previous plans.</p>
                
                {/* Date selector */}
                <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Select Date:</label>
                        <div className="relative">
                            <input
                                type="date"
                                id="copyMealDate"
                                value={copyMealDate.toISOString().split('T')[0]}
                                onChange={(e) => setCopyMealDate(new Date(e.target.value))}
                                className="px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <style jsx>{`
                                #copyMealDate::-webkit-calendar-picker-indicator {
                                    display: none;
                                }
                            `}</style>
                            <button 
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto z-10"
                                onClick={() => {
                                    const input = document.getElementById('copyMealDate');
                                    if (input) {
                                        input.focus();
                                        input.showPicker();
                                    }
                                }}
                            >
                                <FaRegCalendarAlt className="text-gray-400 h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-6 h-96">
                    {/* Left side - Previous meals */}
                    <div className="flex-1 border rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">Meals from {copyMealDate.toLocaleDateString()}</h4>
                        <div className="h-80 overflow-y-auto space-y-2">
                            {/* Get the corresponding Meal plan according to the date */}
                            {getMealsForDate(copyMealDate).map((meal) => (
                                <div key={meal.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div>
                                        <div className="font-medium">{meal.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {meal.type} • {meal.calories} kcal • 
                                            {meal.isCustom ? ' Custom Meal' : ' Standard Meal'}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (!selectedCopyMeals.find(m => m.id === meal.id)) {
                                                setSelectedCopyMeals([...selectedCopyMeals, meal]);
                                            }
                                        }}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                        disabled={selectedCopyMeals.find(m => m.id === meal.id)}
                                    >
                                        {selectedCopyMeals.find(m => m.id === meal.id) ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            ))}
                            
                            {/* If no Meal data is found */}
                            {getMealsForDate(copyMealDate).length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    <p>No meals found for this date</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Right side - Selected meals */}
                    <div className="flex-1 border rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">Meals to Copy</h4>
                        <div className="h-80 overflow-y-auto">
                            {selectedCopyMeals.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <p>Select meals from the left to copy to today</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedCopyMeals.map((meal) => (
                                        <div key={meal.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{meal.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {meal.type} • {meal.calories} kcal
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedCopyMeals(selectedCopyMeals.filter(m => m.id !== meal.id));
                                                }}
                                                className="px-2 py-1 text-red-600 bg-red-100 hover:bg-red-50 rounded"
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
                
                <div className="mt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                            disabled={selectedCopyMeals.length === 0}
                            onClick={onCopyMeals}
                        >
                            Add to Today's Plan
                        </button>
                        <button 
                            className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                            disabled={selectedCopyMeals.length === 0}
                            onClick={() => setSelectedCopyMeals([])}
                        >
                            Clear All
                        </button>
                    </div>
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

export default CopyMealModal;