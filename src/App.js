import React, { useContext } from "react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserContext } from "./context/user.context";
import Login from "./routes/Login/Login";
import SignUp from "./routes/SignUp/SignUp";
import ForgotPassword from "./routes/ForgotPassword/ForgotPassword";
import CreateRecipe from "./routes/CreateRecipe/CreateRecipe";
import SearchRecipes from "./routes/SearchRecipes/SearchRecipes";
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
import Leaderboard from "./routes/LeaderBoard/leaderBoard";
import NutritionCalculator from "./routes/UI-Only-Pages/NutritionCalculator/NutritionCalculator";
import HealthNews from "./routes/HealthNews/HealthNews";
import FoodPreferences from "./routes/FoodPreferences/FoodPreferences";
import HealthTools from "./routes/HealthTools/HealthTools";


function App() {
  const { currentUser } = useContext(UserContext);

  return (
    
    <Router>
      <MainNavbar />
        <Routes>
          <Route path="/" element={currentUser ? <Navigate to="/home" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/leaderboard" element={<Leaderboard />} />  



        {/* Private Routes */}
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
        <Route path="MFAform" element={<MFAform />} />
        <Route
          path="nutrition-calculator"
          element={
            <AuthenticateRoute>
              <NutritionCalculator />
            </AuthenticateRoute>
          }
        />
        <Route path="/preferences" element={<FoodPreferences />} />
        <Route
          path="healthnews"
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
      </Routes>
    </Router>
  );
}

export default App;
