import React, { useContext, useEffect } from "react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import { initializeFontSize } from "./utils/fontSizeManager";
import "./styles/global-dark-mode.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserContext } from "./context/user.context";

import Login from "./routes/Login/Login";
import SignUp from "./routes/SignUp/SignUp";
import ForgotPassword from "./routes/ForgotPassword/ForgotPassword";
import CreateRecipe from "./routes/CreateRecipe/CreateRecipe";
import SearchRecipes from "./routes/SearchRecipes/SearchRecipes";
import CategoryResults from "./routes/SearchRecipes/CategoryResults"; // 🆕
import YourPreferences from "./routes/UI-Only-Pages/YourPreferences/pref-dis-health";
import UserProfilePage from "./routes/UI-Only-Pages/UserProfilePage/userprofile";
import Home from "./routes/Home/Home";
import DietaryRequirements from "./routes/UI-Only-Pages/DietaryRequirements/DietaryRequirements";
import ScanProducts from "./routes/UI-Only-Pages/ScanProducts/ScanProducts";
import Menu from "./routes/UI-Only-Pages/Menu/Menu";
import Recipe from "./components/Recipe";
import Appointment from "./routes/UI-Only-Pages/Appointment/Appointment";
import newMenu from "./routes/NewMenu/newMenu";
import Meal from "./routes/Meal/Meal";
import MFAform from "./routes/MFA/MFAform";
import Dashboard from "./routes/NewMenu/Dashboard";
import AuthenticateRoute from "./routes/AuthenticateRoute/AuthenticateRoute";
import MainNavbar from "./components/MainNavbar";
import FAQ from "./routes/FAQ/faq";
import NutritionCalculator from "./routes/UI-Only-Pages/NutritionCalculator/NutritionCalculator";
import HealthNews from "./routes/HealthNews/HealthNews";
import NewsDetail from "./routes/HealthNews/NewsDetail";
import FoodPreferences from "./routes/FoodPreferences/FoodPreferences";
import HealthTools from "./routes/HealthTools/HealthTools";
import RecipeRating from "./routes/RecipeRating/RecipeRating";
import ShoppingList from "./routes/UI-Only-Pages/ShoppingList/ShoppingList";
import RecipeDetail from "./routes/RecipeRating/RecipeDetail";
import SymptomAssessment from "./routes/SymptomAssessment/SymptomAssessment";
import Leaderboard from "./routes/LeaderBoard/leaderBoard";
import ObesityPredictor from "./routes/survey/ObesityPredictor";
import UiTimer from "./routes/UiTimer/UiTimer"
import Settings from "./routes/Settings/Settings"
import HealthFAQ from "./routes/HealthFAQ/HealthFAQ";
import AuthCallback from "./pages/AuthCallback";
import DailyPlanEdit from "./routes/DailyPlan/DailyPlanEdit";

function App() {
  const { currentUser } = useContext(UserContext);

  return (
    <Router>
      <MainNavbar />
      <ToastContainer />
      <Routes>
        {/* Redirect root based on auth */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/survey" element={<ObesityPredictor />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
        <Route path="/preferences" element={<FoodPreferences />} />
        <Route path="/symptomassessment" element={<SymptomAssessment />} />

        {/* Protected */}
        <Route
          path="/daily-plan-edit"
          element={
            <AuthenticateRoute>
              <DailyPlanEdit />
            </AuthenticateRoute>
          }
        />
        <Route
          path="createRecipe"
          element={
            <AuthenticateRoute>
              <CreateRecipe />
            </AuthenticateRoute>
          }
        />
        <Route
          path="searchRecipes"
          element={
            <AuthenticateRoute>
              <SearchRecipes />
            </AuthenticateRoute>
          }
        />
        <Route
          path="searchRecipes/:category"
          element={
            <AuthenticateRoute>
              <CategoryResults />
            </AuthenticateRoute>
          }
        />
        <Route
          path="yourPreferences"
          element={
            <AuthenticateRoute>
              <YourPreferences />
            </AuthenticateRoute>
          }
        />
        <Route
          path="userProfile"
          element={
            <AuthenticateRoute>
              <UserProfilePage />
            </AuthenticateRoute>
          }
        />
        <Route
          path="Appointment"
          element={
            <AuthenticateRoute>
              <Appointment />
            </AuthenticateRoute>
          }
        />
        <Route
          path="dietaryRequirements"
          element={
            <AuthenticateRoute>
              <DietaryRequirements />
            </AuthenticateRoute>
          }
        />
        <Route
          path="ScanProducts"
          element={
            <AuthenticateRoute>
              <ScanProducts />
            </AuthenticateRoute>
          }
        />
        <Route
          path="RecipeRating"
          element={
            <AuthenticateRoute>
              <RecipeRating />
            </AuthenticateRoute>
          }
        />
        <Route
          path="UiTimer"
          element={
            <AuthenticateRoute>
              <UiTimer />
            </AuthenticateRoute>
          }
        />
        <Route
          path="menu"
          element={
            <AuthenticateRoute>
              <Menu />
            </AuthenticateRoute>
          }
        />
        <Route
          path="recipe"
          element={
            <AuthenticateRoute>
              <Recipe />
            </AuthenticateRoute>
          }
        />
        <Route
          path="Meal"
          element={
            <AuthenticateRoute>
              <Meal />
            </AuthenticateRoute>
          }
        />
        <Route
          path="nutrition-calculator"
          element={
            <AuthenticateRoute>
              <NutritionCalculator />
            </AuthenticateRoute>
          }
        />
        <Route
          path="healthnews"
          element={
            <AuthenticateRoute>
              <HealthNews />
            </AuthenticateRoute>
          }
        />
        <Route path="MFAform" element={<MFAform />} />
        <Route
          path="dashboard"
          element={
            <AuthenticateRoute>
              <Dashboard />
            </AuthenticateRoute>
          }
        />
        <Route
          path="HealthTools"
          element={
            <AuthenticateRoute>
              <HealthTools />
            </AuthenticateRoute>
          }
        />
        <Route
          path="shopping-list"
          element={
            <AuthenticateRoute>
              <ShoppingList />
            </AuthenticateRoute>
          }
        />
        <Route
          path="HealthFAQ"
          element={
            <AuthenticateRoute>
              <HealthFAQ />
            </AuthenticateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
