import React, { useContext, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css'
import './App.css';
import { BrowserRouter as Router, Routes, Route, Switch } from 'react-router-dom';
import { UserContext } from "./context/user.context";
import Login from './routes/Login/Login';
import SignUp from './routes/SignUp/SignUp';
import Landing from './routes/UI-Only-Pages/Landing/Landing';
import ForgotPassword from './routes/ForgotPassword/ForgotPassword';
import NavigationBarAndFooterSignedIn from './components/navigation_bars_and_footer/signed_in/NavigationBarAndFooterSignedIn';
import NavigationBarAndFooterSignedOut from './components/navigation_bars_and_footer/signed_out/NavigationBarAndFooterSignedOut';
import CreateRecipe from './routes/CreateRecipe/CreateRecipe';
import SearchRecipes from './routes/SearchRecipes/SearchRecipes';
import YourPreferences from './routes/UI-Only-Pages/YourPreferences/YourPreferences'
import SignInSignUp from './routes/UI-Only-Pages/SignInSignUp/SignInSignUp';
import UserProfilePage from './routes/UI-Only-Pages/UserProfilePage/userprofile';
import Home from './routes/Home/Home';
import DietaryRequirements from './routes/UI-Only-Pages/DietaryRequirements/Nutrition-Snacks';
import Menu from './routes/UI-Only-Pages/Menu/Menu';
import Recipe from './components/Recipe';
// import Allergy from './components/Allergy';
// import Allergy from './Allergy';
import Meal from './routes/Meal/Meal';
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

  //Obtain the current user from the UserContext (from user.context.jsx)
  const { currentUser } = useContext(UserContext)
  var isLoggedIn = false;

  //If the user has logged in, set the isLoggedIn variable to true, else false
  if (currentUser) {
    isLoggedIn = true;
  }
  else {
    isLoggedIn = false
  }

  return (

    <Router>
      <Routes>
        <Route path='/' element={isLoggedIn ? <NavigationBarAndFooterSignedIn /> : <NavigationBarAndFooterSignedOut />}>

          {/* Let the Login page be accessible by the path '/' alone */}
          {<Route index element={<Home />} />}

          {/* All the possible routes of under the path '/', followed by the path-name: */}
          <Route path='login' element={<Login />} />
          <Route path='signUp' element={<SignUp />} />
          <Route path='forgotPassword' element={<ForgotPassword />} />
          <Route path='createRecipe' element={<CreateRecipe />} />
          <Route path='searchRecipes' element={<SearchRecipes />} />

          {/* UI-Only-Pages (in the path: ./routes/UI-Only-Pages/) */}
          <Route path='landing' element={<Landing />} />
          <Route path='YourPreferences' element={<YourPreferences />} />
          <Route path='signInSignUp' element={<SignInSignUp />} />
          <Route path='userProfile' element={<UserProfilePage />} />
          <Route path='dietaryRequirements' element={<DietaryRequirements />} />
          <Route path='menu' element={<Menu />} />
          <Route path='recipe' element={<Recipe />} />
          {/* <Route path="/components/allergy" component={Allergy} /> */}
          <Route path='Meal' element={<Meal />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;