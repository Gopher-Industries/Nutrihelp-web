import React, { useContext, useEffect } from "react";
import "semantic-ui-css/semantic.min.css";
import "./App.css";
import { initializeFontSize } from "./utils/fontSizeManager";
import "./styles/global-dark-mode.css";
import "./styles/root-style-system.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserContext } from "./context/user.context";

import Login from "./routes/Login/Login";
import SignUp from "./routes/SignUp/SignUp";
import ForgotPassword from "./routes/ForgotPassword/ForgotPassword";
import ForgotPasswordVerify from "./routes/ForgotPassword/ForgotPasswordVerify";
import ForgotPasswordReset from "./routes/ForgotPassword/ForgotPasswordReset";
import CreateRecipe from "./routes/CreateRecipe/CreateRecipe";
import SearchRecipes from "./routes/SearchRecipes/SearchRecipes";
import CategoryResults from "./routes/SearchRecipes/CategoryResults";
import YourPreferences from './routes/UI-Only-Pages/YourPreferences/YourPreferences';
import UserProfilePage from "./routes/UI-Only-Pages/UserProfilePage/userprofile";
import Home from "./routes/Home/Home";
import DietaryRequirements from "./routes/UI-Only-Pages/DietaryRequirements/DietaryRequirements";
import ScanProducts from "./routes/UI-Only-Pages/ScanProducts/ScanProducts";
import ScanMealReview from "./routes/UI-Only-Pages/ScanProducts/ScanMealReview";
import Menu from "./routes/UI-Only-Pages/Menu/Menu";
import Recipe from "./routes/MyRecipe/Recipe";
import Appointment from "./routes/UI-Only-Pages/Appointment/Appointment";
import newMenu from "./routes/NewMenu/newMenu";
import Meal from "./routes/Meal/Meal";
import MealDetail from "./routes/Meal/MealDetail";
import Scan from "./routes/ScanBarcode/Scan.jsx"
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
import MealRecipeDetail from "./routes/Meal/MealRecipeDetail";
import SymptomAssessment from "./routes/SymptomAssessment/SymptomAssessment";
import Leaderboard from "./routes/LeaderBoard/leaderBoard";
import ObesityPredictor from "./routes/survey/ObesityPredictor";
import Predictionresult from "./routes/survey/predictionresult";
import UiTimer from "./routes/UiTimer/UiTimer";
import Settings from "./routes/Settings/Settings";
import HealthFAQ from "./routes/HealthFAQ/HealthFAQ";
import FitnessRoadmap from "./routes/survey/FitnessRoadmap";
import Community from "./routes/Community/Community";
import ChatPage from "./routes/chat/ChatPage";
import PostDetail from "./routes/Community/PostDetail";
import ScanBarcode from "./routes/ScanBarcode/ScanBarcode";
import FoodDetails from "./routes/UI-Only-Pages/ScanProducts/FoodDetails";
import UploadHistory from "./routes/UI-Only-Pages/ScanProducts/UploadHistory";
import AuthCallback from "./pages/AuthCallback";
import DailyPlanEdit from "./routes/DailyPlan/DailyPlanEdit";
import Account from "./routes/Account/Account.js";
import TextToSpeechControl from "./components/TextToSpeech/TextToSpeech";
import { isAuthPath } from "./utils/ttsRouteUtils";
/* -------------------------------
   GLOBAL AUTHENTICATED LAYOUT
-------------------------------- */
function GlobalAuthenticatedLayout() {
  const location = useLocation();
  const { currentUser } = useContext(UserContext);

  const shouldHideGlobalControls = isAuthPath(location.pathname);

  if (shouldHideGlobalControls) return null;

  return (
    <>
      <MainNavbar />
      {currentUser ? <TextToSpeechControl /> : null}
    </>
  );
}

function CanonicalMealRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={`${location.pathname.toLowerCase()}${location.search}${location.hash}`}
      replace
    />
  );
}

import WeeklyMealPlanPage from './routes/Meal/WeeklyMealPlanPage';

function App() {
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    initializeFontSize();
  }, []);

  return (
    <Router>
      {/* Show navbar only on allowed pages */}
      <GlobalAuthenticatedLayout />

      <ToastContainer />

      <Routes>
        <Route
          path="/"
          element={
            currentUser ? <Navigate to="/home" /> : <Navigate to="/login" />
          }
        />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />


        {/* Forgot password flow */}
        {/* legacy route */}
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        {/* new multi-step flow routes */}
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/forgot/verify" element={<ForgotPasswordVerify />} />
        <Route path="/forgot/reset" element={<ForgotPasswordReset />} />

        <Route path="/mfa" element={<MFAform />} />

        <Route path="/home" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/community/post/:postId" element={<PostDetail />} />

        <Route path="/survey" element={<ObesityPredictor />} />
        <Route path="/survey/result" element={<Predictionresult />} />
        <Route path="/roadmap" element={<FitnessRoadmap />} />
        <Route path="/Scan" element={<Scan />} />
        <Route path="/scan" element={<Scan />} />
        <Route caseSensitive path="/Meal/*" element={<CanonicalMealRedirect />} />
        <Route
          path="/dish/detail"
          element={
            <AuthenticateRoute>
              <MealDetail />
            </AuthenticateRoute>
          }
        />
        <Route
          path="/meal/detail"
          element={
            <AuthenticateRoute>
              <MealDetail />
            </AuthenticateRoute>
          }
        />
        <Route path="/account" element={<Account />} />
        {/* PRIVATE ROUTES */}
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
          path="appointment"
          element={
            <AuthenticateRoute>
              <Appointment />
            </AuthenticateRoute>
          }
        />

        <Route
          path="dietary-requirements"
          element={
            <AuthenticateRoute>
              <DietaryRequirements />
            </AuthenticateRoute>
          }
        />

        <Route
          path="scan-products"
          element={
            <AuthenticateRoute>
              <ScanProducts />
            </AuthenticateRoute>
          }
        />
        <Route
          path="scan-review"
          element={
            <AuthenticateRoute>
              <ScanMealReview />
            </AuthenticateRoute>
          }
        />
        <Route
          path="food-details/:foodName"
          element={
            <AuthenticateRoute>
              <FoodDetails />
            </AuthenticateRoute>
          }
        />
        <Route
          path="upload-history"
          element={
            <AuthenticateRoute>
              <UploadHistory />
            </AuthenticateRoute>
          }
        />

        <Route
          path="recipe-rating"
          element={
            <AuthenticateRoute>
              <RecipeRating />
            </AuthenticateRoute>
          }
        />

        <Route
          path="ui-timer"
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
          path="/recipe/:id"
          element={
            <AuthenticateRoute>
              <MealRecipeDetail />
            </AuthenticateRoute>
          }
        />
        <Route
          path="/meal"
          element={
            <AuthenticateRoute>
              <Meal />
            </AuthenticateRoute>
          }
        />
        <Route
          path="/meal/:preselectedMealType"
          element={
            <AuthenticateRoute>
              <Meal />
            </AuthenticateRoute>
          }
        />

        <Route path="/weekly-plan" element={<WeeklyMealPlanPage />} />
        

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route
          path="nutrition-calculator"
          element={
            <AuthenticateRoute>
              <NutritionCalculator />
            </AuthenticateRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <AuthenticateRoute>
              <FoodPreferences />
            </AuthenticateRoute>
          }
        />

        <Route path="/symptomassessment" element={<SymptomAssessment />} />

        <Route
          path="healthnews"
          element={
            <AuthenticateRoute>
              <HealthNews />
            </AuthenticateRoute>
          }
        />

        <Route
          path="healthnews/:id"
          element={
            <AuthenticateRoute>
              <NewsDetail />
            </AuthenticateRoute>
          }
        />

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
          path="settings"
          element={
            <AuthenticateRoute>
              <Settings />
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

        <Route path="ScanBarcode" element={<ScanBarcode />} />
        <Route path="scan" element={<Scan />}/>
      </Routes>
    </Router>
  );
}

export default App;
