import React, { useState } from "react";
import goalIcon from "../../images/goal.png";
import foodIcon from "../../images/food.png";
import exerciseIcon from "../../images/exercise.png";

const UserDashboard = () => {
  // 状态管理
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNutrientModal, setShowNutrientModal] = useState(false);
  const [baseGoal, setBaseGoal] = useState(5565);
  const [food, setFood] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [exerciseHours, setExerciseHours] = useState(0);

  // 临时输入状态（用于弹窗编辑）
  const [tempBaseGoal, setTempBaseGoal] = useState(baseGoal);
  const [tempFood, setTempFood] = useState(food);
  const [tempExercise, setTempExercise] = useState(exercise);
  const [tempExerciseHours, setTempExerciseHours] = useState(exerciseHours);

  // 营养素数据状态
  const [nutrients, setNutrients] = useState([
    { label: "Carbohydrates", color: "#22c55e", current: 130, total: 166, unit: "g" },
    { label: "Fat", color: "#60a5fa", current: 20, total: 44, unit: "g" },
    { label: "Protein", color: "#facc15", current: 50, total: 67, unit: "g" },
    { label: "Sugar", color: "#fb923c", current: 30, total: 50, unit: "g" },
    { label: "Fiber", color: "#06b6d4", current: 16, total: 25, unit: "g" },
    { label: "Sodium", color: "#f9a8d4", current: 100, total: 2300, unit: "mg" },
    { label: "Cholesterol", color: "#ef4444", current: 50, total: 300, unit: "mg" },
  ]);

  // 临时营养素数据
  const [tempNutrients, setTempNutrients] = useState(nutrients);

  // 计算剩余能量值（按照公式 Remaining = Goal - Food + Exercise）
  const remaining = baseGoal - food + exercise;

  // 计算进度百分比（基于食用的食物与目标的比例）
  const progressPercentage = Math.min(((food - exercise) / baseGoal) * 100, 100);
  
  // 判断是否为负数
  const isNegative = remaining < 0;

  // 处理保存编辑
  const handleSaveEdit = () => {
    setBaseGoal(tempBaseGoal);
    setFood(tempFood);
    setExercise(tempExercise);
    setExerciseHours(tempExerciseHours);
    setShowEditModal(false);
  };

  // 处理关闭弹窗
  const handleCloseModal = () => {
    // 重置临时值为当前值
    setTempBaseGoal(baseGoal);
    setTempFood(food);
    setTempExercise(exercise);
    setTempExerciseHours(exerciseHours);
    setShowEditModal(false);
  };

  // 处理营养素编辑
  const handleSaveNutrients = () => {
    setNutrients(tempNutrients);
    setShowNutrientModal(false);
  };

  // 处理关闭营养素弹窗
  const handleCloseNutrientModal = () => {
    setTempNutrients(JSON.parse(JSON.stringify(nutrients)));
    setShowNutrientModal(false);
  };

  // 计算圆环的路径
  const radius = 120;
  const strokeWidth = 16;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const absoluteProgressPercentage = Math.abs(progressPercentage);
  const strokeDashoffset = circumference - (Math.min(absoluteProgressPercentage, 100) / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 能量编辑弹窗 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Daily Values</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Goal (kJ)
                </label>
                <input
                  type="number"
                  value={tempBaseGoal}
                  onChange={(e) => setTempBaseGoal(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food (kJ)
                </label>
                <input
                  type="number"
                  value={tempFood}
                  onChange={(e) => setTempFood(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise (kJ)
                </label>
                <input
                  type="number"
                  value={tempExercise}
                  onChange={(e) => setTempExercise(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise Duration (hours)
                </label>
                <input
                  type="number"
                  value={tempExerciseHours}
                  onChange={(e) => setTempExerciseHours(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                  step="0.1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-purple-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 营养素编辑弹窗 */}
      {showNutrientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Nutrients</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tempNutrients.map((nutrient, index) => (
                <div key={nutrient.label} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {nutrient.label}
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={nutrient.current}
                        onChange={(e) => {
                          const newNutrients = [...tempNutrients];
                          newNutrients[index].current = Number(e.target.value);
                          setTempNutrients(newNutrients);
                        }}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Current"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={nutrient.total}
                        onChange={(e) => {
                          const newNutrients = [...tempNutrients];
                          newNutrients[index].total = Number(e.target.value);
                          setTempNutrients(newNutrients);
                        }}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Target"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseNutrientModal}
                className="px-4 py-2 text-gray-700 bg-white border rounded hover:bg-purple-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNutrients}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 - 横向布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：卡路里跟踪器卡片 */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          {/* 标题和编辑按钮 - 相对定位 */}
          <div className="relative mb-6">
            {/* 左侧标题 */}
            <h2 className="text-2xl font-bold mb-1">Kilojoules</h2>
            {/* 居中的公式 */}
            <div className="text-center">
              <p className="text-gray-500 text-sm">Remaining = Goal - Food + Exercise</p>
            </div>
            {/* 右上角的编辑按钮 */}
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute top-0 right-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          
          {/* 环形进度圈和数据显示 - 居中布局 */}
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* 环形进度圈区域 */}
            <div className="flex items-center justify-center space-x-12">
              {/* 环形进度圈 */}
              <div className="relative flex items-center justify-center">
                <svg
                  height={radius * 2}
                  width={radius * 2}
                  className="transform -rotate-90"
                >
                  {/* 背景圆环 */}
                  <circle
                    stroke="#E5E7EB"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  {/* 进度圆环 */}
                  <circle
                    stroke={isNegative ? "#EF4444" : "#3B82F6"}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                </svg>
                
                {/* 中心显示剩余值 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className={`text-3xl font-bold ${isNegative ? 'text-red-500' : ''}`}>
                    {remaining.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Remaining</p>
                </div>
              </div>
              
              {/* 右侧数据显示 */}
              <div className="space-y-4">
                {/* Base Goal */}
                <div className="flex items-center">
                  <img src={goalIcon} alt="Goal" className="h-12 w-12 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Base Goal</p>
                    <p className="font-bold">{baseGoal.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Food */}
                <div className="flex items-center">
                  <img src={foodIcon} alt="Food" className="h-12 w-12 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Food</p>
                    <p className="font-bold">{food.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Exercise */}
                <div className="flex items-center">
                  <img src={exerciseIcon} alt="Exercise" className="h-12 w-12 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Exercise</p>
                    <p className="font-bold">{exercise.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 底部说明文字 */}
            <div className="text-center text-sm text-gray-600 max-w-md">
              <p>
                {isNegative ? (
                  <span className="text-red-500">
                    You have exceeded your daily energy goal. This means that you have consumed more energy from food than you have targeted (even after deducting the amount of energy you have consumed from exercise). You may need to eat less food or exercise more.
                  </span>
                ) : (
                  <span className="text-green-600">
                    You can still take in kilojoules of energy. This means you have an energy budget available. It is recommended to plan the rest of your meal wisely.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* 右侧：营养素进度条卡片 */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Nutrients</h3>
            <button
              onClick={() => setShowNutrientModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          </div>
          
          <div className="space-y-4">
            {nutrients.map(({ label, color, current, total, unit = "g" }) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <p className="font-semibold" style={{ color }}>{label}</p>
                  <p className="text-gray-500">
                    {current || 0}{unit}/{total || 0}{unit}
                  </p>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded">
                  <div
                    className="h-2 rounded"
                    style={{ width: `${Math.min((current / total) * 100, 100)}%`, backgroundColor: color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;