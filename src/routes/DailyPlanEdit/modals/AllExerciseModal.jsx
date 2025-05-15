

const AllExerciseModal = ({ 
    show, 
    onClose, 
    availableExercises, 
    selectedExercises, 
    setSelectedExercises,
    onAddExercises
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-4xl shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">All Exercise</h3>
                <p className="text-gray-700 text-center mb-6">Mix and match exercises to create your custom routine.</p>
                
                <div className="flex gap-6 h-96">
                    {/* Left side - Available exercises */}
                    <div className="flex-1 border rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">Available Exercises</h4>
                        <div className="h-80 overflow-y-auto space-y-2">
                            {availableExercises.map((exercise) => (
                                <div key={exercise.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                    <div>
                                        <div className="font-medium">{exercise.name}</div>
                                        <div className="text-sm text-gray-500">{exercise.type} • {exercise.duration}</div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (!selectedExercises.find(ex => ex.id === exercise.id)) {
                                                setSelectedExercises([...selectedExercises, exercise]);
                                            }
                                        }}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                        disabled={selectedExercises.find(ex => ex.id === exercise.id)}
                                    >
                                        {selectedExercises.find(ex => ex.id === exercise.id) ? 'Added' : 'Add'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Right side - Selected exercises */}
                    <div className="flex-1 border rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-3">Your Custom Routine</h4>
                        <div className="h-80 overflow-y-auto">
                            {selectedExercises.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <p>Select exercises from the left to build your routine</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedExercises.map((exercise) => (
                                        <div key={exercise.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div>
                                                <div className="font-medium">{exercise.name}</div>
                                                <div className="text-sm text-gray-500">{exercise.type} • {exercise.duration}</div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exercise.id));
                                                }}
                                                className="px-2 py-1 text-red-600 bg-red-100 hover:bg-red-200 rounded"
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
                            disabled={selectedExercises.length === 0}
                            onClick={onAddExercises}
                        >
                            Generate Combination
                        </button>
                        <button 
                            className="flex-1 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                            disabled={selectedExercises.length === 0}
                            onClick={() => setSelectedExercises([])}
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

export default AllExerciseModal;