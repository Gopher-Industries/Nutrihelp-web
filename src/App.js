import React, { useContext, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css'
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from "./context/user.context";
import Login from './routes/Login/Login';
import SignUp from './routes/SignUp/SignUp';
import Landing from './routes/UI-Only-Pages/Landing/Landing';
import ForgotPassword from './routes/ForgotPassword/ForgotPassword';
import NavigationBarAndFooterSignedIn from './components/navigation_bars_and_footer/signed_in/NavigationBarAndFooterSignedIn';
import NavigationBarAndFooterSignedOut from './components/navigation_bars_and_footer/signed_out/NavigationBarAndFooterSignedOut';
import CreateRecipe from './routes/CreateRecipe/CreateRecipe';
import SearchRecipes from './routes/SearchRecipes/SearchRecipes';
import YourPreferences from './routes/UI-Only-Pages/YourPreferences/pref-dis-health';
import SignInSignUp from './routes/UI-Only-Pages/SignInSignUp/SignInSignUp';
import UserProfilePage from './routes/UI-Only-Pages/UserProfilePage/userprofile';
import Home from './routes/Home/Home';
import DietaryRequirements from './routes/UI-Only-Pages/DietaryRequirements/DietaryRequirements';
import ScanProducts from './routes/UI-Only-Pages/ScanProducts/ScanProducts';
import Menu from './routes/UI-Only-Pages/Menu/Menu';
import Recipe from './components/Recipe';
import Appointment from './routes/UI-Only-Pages/Appointment/Appointment';
import newMenu from './routes/NewMenu/newMenu';
import Meal from './routes/Meal/Meal';
import MFAform from './routes/MFA/MFAform';
import Dashboard from './routes/NewMenu/Dashboard';
import AuthenticateRoute from './routes/AuthenticateRoute/AuthenticateRoute';

function App() {

  useEffect(() => {
    (function (d, m) {
      var kommunicateSettings =
        { "appId": "6ba050337f189922ca5b3c0e644a05e", "popupWidget": true, "automaticChatOpenOnNavigation": true };
      var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
      window.kommunicate = m; m._globals = kommunicateSettings;
    })(document, window.kommunicate || {});
  }, []);  // Empty dependency array ensures this runs only once after component mount

  // Obtain the current user from the UserContext (from user.context.jsx)
  const { currentUser } = useContext(UserContext);
  var isLoggedIn = false;

  // If the user has logged in, set the isLoggedIn variable to true, else false
  if (currentUser) {
    isLoggedIn = true;
  }
  else {
    isLoggedIn = false;
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={isLoggedIn ? <NavigationBarAndFooterSignedIn /> : <NavigationBarAndFooterSignedOut />}>

          {/* Let the Login page be accessible by the path '/' alone */}
          {<Route index element={<Home />} />}

          {/* Public Routes */}
          <Route path='login' element={<Login />} />
          <Route path='signUp' element={<SignUp />} />
          <Route path='forgotPassword' element={<ForgotPassword />} />
          <Route path='landing' element={<Landing />} />
          <Route path='signInSignUp' element={<SignInSignUp />} />

          {/* Private Routes */}
          <Route
            path='createRecipe'
            element={
              <AuthenticateRoute>
                <CreateRecipe />
              </AuthenticateRoute>
            }
          />
          <Route
            path='searchRecipes'
            element={
              <AuthenticateRoute>
                <SearchRecipes />
              </AuthenticateRoute>
            }
          />
          <Route
            path='yourPreferences'
            element={
              <AuthenticateRoute>
                <YourPreferences />
              </AuthenticateRoute>
            }
          />
          <Route
            path='userProfile'
            element={
              <AuthenticateRoute>
                <UserProfilePage />
              </AuthenticateRoute>
            }
          />
          <Route
            path='Appointment'
            element={
              <AuthenticateRoute>
                <Appointment />
              </AuthenticateRoute>
            }
          />
          <Route
            path='dietaryRequirements'
            element={
              <AuthenticateRoute>
                <DietaryRequirements />
              </AuthenticateRoute>
            }
          />
          <Route
            path='ScanProducts'
            element={
              <AuthenticateRoute>
                <ScanProducts />
              </AuthenticateRoute>
            }
          />
          <Route
            path='menu'
            element={
              <AuthenticateRoute>
                <Menu />
              </AuthenticateRoute>
            }
          />
          <Route
            path='recipe'
            element={
              <AuthenticateRoute>
                <Recipe />
              </AuthenticateRoute>
            }
          />
          <Route
            path='Meal'
            element={
              <AuthenticateRoute>
                <Meal />
              </AuthenticateRoute>
            }
          />
          <Route
            path='MFAform'
            element={
              <AuthenticateRoute>
                <MFAform />
              </AuthenticateRoute>
            }
          />
          <Route
            path='dashboard'
            element={
              <AuthenticateRoute>
                <Dashboard />
              </AuthenticateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
