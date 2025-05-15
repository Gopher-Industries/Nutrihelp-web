

const ExerciseInfoModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
                <h3 className="text-2xl font-bold text-purple-900 mb-4 text-center">Exercise Features</h3>
                <div className="space-y-4 text-gray-700">
                    <div>
                        <h4 className="font-semibold text-purple-900">Workout Routines</h4>
                        <p className="text-sm">Recommended fitness plans based on your HealthGoal. Preview and add curated workout routines designed specifically for your goals.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-purple-900">Create My Exercise</h4>
                        <p className="text-sm">Create your own custom exercises. Design unique workouts not available in our library by filling in your own content and details.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-purple-900">All Exercise</h4>
                        <p className="text-sm">Browse our complete exercise library organized by HealthGoal. Mix and match individual exercises to create your personalized workout plan.</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ExerciseInfoModal;