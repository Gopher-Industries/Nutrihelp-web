import React from "react";
import goalIcon from "../../images/goal.png";
import foodIcon from "../../images/food.png";
import exerciseIcon from "../../images/exercise.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const UserDashboard = () => {
  const nutrients = [
    { label: "Carbohydrates", color: "#22c55e", current: 130, total: 166 },
    { label: "Fat", color: "#60a5fa", current: 20, total: 44 },
    { label: "Protein", color: "#facc15", current: 50, total: 67 },
    { label: "Sugar", color: "#fb923c", current: 30, total: 50 },
    { label: "Fiber", color: "#06b6d4", current: 16, total: 25 },
    { label: "Sodium", color: "#f9a8d4", current: 100, total: 2300, unit: "mg" },
    { label: "Cholesterol", color: "#ef4444", current: 50, total: 300, unit: "mg" },
  ];

  const weightData = [
    { date: "12/21", weight: 132 },
    { date: "01/20", weight: 130 },
    { date: "02/19", weight: 127 },
    { date: "03/21", weight: 123 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Calorie Tracker Card */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-2">Today</h2>
        <h3 className="text-xl font-semibold">Kilojoules</h3>
        <p className="text-gray-500 text-sm mb-4">Remaining = Goal - Food + Exercise</p>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-300 rounded mb-6">
          <div className="h-2 bg-purple-400 rounded w-1/2" />
        </div>

        {/* Three information cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center p-4 rounded-xl shadow" style={{ backgroundColor: "#FFFDC9" }}>
            <img src={goalIcon} alt="Goal" className="h-20 w-20 mr-4" />
            <div>
              <p className="font-bold">Base Goal</p>
              <input type="number" placeholder="Enter Input" className="border px-2 py-1 rounded w-24 mt-1" />
              <span className="ml-2 text-gray-600 text-sm">kJ</span>
            </div>
          </div>

          <div className="flex items-center p-4 rounded-xl shadow" style={{ backgroundColor: "#B3FFB1" }}>
            <img src={foodIcon} alt="Food" className="h-20 w-20 mr-4" />
            <div>
              <p className="font-bold">Food</p>
              <input type="number" placeholder="Enter Input" className="border px-2 py-1 rounded w-24 mt-1" />
              <span className="ml-2 text-gray-600 text-sm">kJ</span>
            </div>
          </div>

          <div className="flex items-center p-4 rounded-xl shadow" style={{ backgroundColor: "#CBE5FF" }}>
            <img src={exerciseIcon} alt="Exercise" className="h-20 w-20 mr-4" />
            <div>
              <p className="font-bold">Exercise</p>
              <input type="number" placeholder="Enter Input" className="border px-2 py-1 rounded w-24 mt-1" />
              <div className="flex items-center mt-2">
                <input type="number" placeholder="Enter Input" className="border px-2 py-1 rounded w-24" />
                <span className="ml-2 text-gray-600 text-sm">hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nutrient progress bar */}
        <div className="space-y-4">
          {nutrients.map(({ label, color, current, total, unit = "g" }) => (
            <div key={label}>
              <div className="flex justify-between text-sm">
                <p className="font-semibold text-[14px]" style={{ color }}>{label}</p>
                <p className="text-gray-500 text-[14px]">
                  {current || 0}
                  {unit}/{total || 0}
                  {unit}
                </p>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className="h-2 rounded"
                  style={{ width: `${(current / total) * 100}%`, backgroundColor: color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weight chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-2">Weight</h2>
        <p className="text-gray-500 text-sm mb-4">Last 90 days</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[115, 140]} tickCount={6} />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="blue" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
