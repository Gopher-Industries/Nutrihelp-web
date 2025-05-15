

const OverviewModal = ({ show, onClose, selectedDate, dailyMealPlans }) => {
    if (!show) return null;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const dailyPlan = dailyMealPlans[dateKey] || { meals: [], water: 0, exercises: [] };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Today's Summary</h3>
                <div className="text-center text-gray-600 font-medium mb-6">
                    Date: {selectedDate.toLocaleDateString('en-CA')}
                </div>
                <ul className="list-none space-y-3 mb-6">
                    <li className="text-gray-700 relative pl-8">
                        <span className="absolute left-2">•</span>
                        Meals added: {dailyPlan.meals.length}
                    </li>
                    <li className="text-gray-700 relative pl-8">
                        <span className="absolute left-2">•</span>
                        Water intake: {dailyPlan.water} ml
                    </li>
                    <li className="text-gray-700 relative pl-8">
                        <span className="absolute left-2">•</span>
                        Exercises planned: {dailyPlan.exercises.length}
                    </li>
                </ul>
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default OverviewModal;