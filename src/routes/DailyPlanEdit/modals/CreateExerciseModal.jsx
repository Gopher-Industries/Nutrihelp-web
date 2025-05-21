
const CreateExerciseModal = ({ show, onClose }) => {
    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Exercise created successfully! Your custom exercise has been added to the library.');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Create My Exercise</h3>
                <p className="text-gray-700 text-center mb-6">Create your own custom exercise not found in our library.</p>
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Custom Cardio Routine"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Type</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" required>
                                <option value="">Select Type</option>
                                <option>Strength</option>
                                <option>Cardio</option>
                                <option>Flexibility</option>
                                <option>Balance</option>
                                <option>Mixed</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="e.g., 30"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Repetitions/Sets</label>
                            <input
                                type="text"
                                placeholder="e.g., 3 sets of 15"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Intensity Level</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option>Low</option>
                                <option>Moderate</option>
                                <option>High</option>
                                <option>Very High</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Calories Burned</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g., 200"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kilojoules (optional)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g., 837"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            placeholder="Describe how to perform this exercise..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        ></textarea>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Needed</label>
                        <input
                            type="text"
                            placeholder="e.g., Dumbbells, Yoga Mat, None"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            type="submit"
                            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                            Create Exercise
                        </button>
                        <button 
                            type="button"
                            onClick={onClose}
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

export default CreateExerciseModal;