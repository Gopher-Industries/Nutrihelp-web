// pages/NutritionPage.jsx
import React, { useEffect, useState } from "react";
import "./styles/global.css";
import { loadPrefs, savePrefs } from "./utils/storage";
import MealPlan from "./MealPlan";
import NutritionTips from "./NutritionTips";
import "./styles/global.css";
import UserPreferences from "./UserPreferences";
import EditPreferencesModal from "./EditPreferencesModal";
import PantryPlanner from "./PantryPlanner";
import NutriSnapshot from "./NutriSnapshot";
import WaterCounter from "./WaterCounter"


const LS_KEY = "nutrihelp:prefs:v1";

const DEFAULT_PREFS = {
  name: "John Doe",
  dietTypes: ["Diabetic", "Vegetarian"],
  allergies: ["Nuts"],
  dislikes: [],
};

const NutritionPage = () => {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loaded = loadPrefs(LS_KEY, DEFAULT_PREFS);
    // Convert arrays to comma string for inputs in modal component
    setPrefs(loaded);
  }, []);

  const openEdit = () => setModalOpen(true);
  const closeEdit = () => setModalOpen(false);

  const handleSave = (updated) => {
    setPrefs(updated);
    savePrefs(LS_KEY, updated);
    setModalOpen(false);
  };

  return (
    <div className="container">
      <UserPreferences prefs={prefs} onEdit={openEdit} />
      <MealPlan />
      <WaterCounter />    {/* 💧 Hydration Tracker */}
      <NutriSnapshot />   {/* 📊 Calorie & Macros Dashboard */}
      
      <PantryPlanner /> 
      <NutritionTips />
      <EditPreferencesModal
        open={modalOpen}
        initial={{
          ...prefs,
          // Provide comma-separated strings for editing
          allergies: Array.isArray(prefs.allergies)
            ? prefs.allergies.join(", ")
            : prefs.allergies || "",
          dislikes: Array.isArray(prefs.dislikes)
            ? prefs.dislikes.join(", ")
            : prefs.dislikes || "",
        }}
        onCancel={closeEdit}
        onSave={handleSave}
      />
    </div>
  );
};

export default NutritionPage;
