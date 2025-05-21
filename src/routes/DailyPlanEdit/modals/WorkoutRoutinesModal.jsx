import React from "react";

const WorkoutRoutinesModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-3xl shadow-lg">
                <h3 className="text-2xl font-bold text-purple-600 mb-4 text-center">Workout Routines</h3>
                <p className="text-gray-700 text-center mb-6">Browse recommended workout routines for Weight Loss goal.</p>
                
                {/* Using inline styles to enforce a grid layout */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '1rem', 
                    marginBottom: '1.5rem' 
                }}>
                    {/* Beginner Weight Loss */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 bg-white">
                        <h4 className="font-bold text-purple-600 mb-2">Beginner Weight Loss</h4>
                        <ul className="text-sm text-gray-700 space-y-1 mb-3">
                            <li>• Walking - 20 minutes</li>
                            <li>• Basic Squats - 2 sets of 10</li>
                            <li>• Wall Push-ups - 2 sets of 8</li>
                            <li>• Standing Side Crunches - 15 each side</li>
                        </ul>
                        <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                            Add Routine
                        </button>
                    </div>
                    
                    {/* Cardio Burn */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 bg-white">
                        <h4 className="font-bold text-purple-600 mb-2">Cardio Burn</h4>
                        <ul className="text-sm text-gray-700 space-y-1 mb-3">
                            <li>• Jumping Jacks - 3 sets of 30 seconds</li>
                            <li>• High Knees - 2 minutes</li>
                            <li>• Burpees - 2 sets of 8</li>
                            <li>• Mountain Climbers - 1 minute</li>
                        </ul>
                        <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                            Add Routine
                        </button>
                    </div>
                    
                    {/* Strength & Fat Burn */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 bg-white">
                        <h4 className="font-bold text-purple-600 mb-2">Strength & Fat Burn</h4>
                        <ul className="text-sm text-gray-700 space-y-1 mb-3">
                            <li>• Squats - 3 sets of 15</li>
                            <li>• Push-ups - 3 sets of 10</li>
                            <li>• Lunges - 3 sets of 12 per leg</li>
                            <li>• Plank - 2 sets of 45 seconds</li>
                        </ul>
                        <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                            Add Routine
                        </button>
                    </div>
                    
                    {/* HIIT Fat Blaster */}
                    <div className="border rounded-lg p-4 hover:bg-gray-50 bg-white">
                        <h4 className="font-bold text-purple-600 mb-2">HIIT Fat Blaster</h4>
                        <ul className="text-sm text-gray-700 space-y-1 mb-3">
                            <li>• Sprint in Place - 30 seconds on/off × 8</li>
                            <li>• Jump Squats - 4 sets of 15</li>
                            <li>• Plank to Push-up - 3 sets of 8</li>
                            <li>• Side Plank - 30 seconds each side</li>
                        </ul>
                        <button className="w-full py-2 bg-purple-600 text-white rounded hover:bg-green-600 transition-colors">
                            Add Routine
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WorkoutRoutinesModal;