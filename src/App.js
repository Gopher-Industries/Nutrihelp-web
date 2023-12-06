import React, { useContext, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css'
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserContext } from "./context/user.context";
import Login from './routes/Login/Login';
import SignUp from './routes/SignUp/SignUp';
import Landing from './components/Landing';
import ForgotPassword from './routes/ForgotPassword/ForgotPassword';
import NavigationBarAndFooterSignedIn from './components/navigation_bars_and_footer/signed_in/NavigationBarAndFooterSignedIn';
import NavigationBarAndFooterSignedOut from './components/navigation_bars_and_footer/signed_out/NavigationBarAndFooterSignedOut';
import CreateRecipe from './routes/CreateRecipe/CreateRecipe';
import SearchRecipes from './routes/SearchRecipes/SearchRecipes';

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
          {/* <Route index element={<Landing />} /> */}
          <Route index element={<PreferencesComponent />} />

          {/* All the possible routes of under the path '/', followed by the path-name: */}
          <Route path='login' element={<Login />} />
          <Route path='signUp' element={<SignUp />} />
          <Route path='forgotPassword' element={<ForgotPassword />} />
          <Route path='createRecipe' element={<CreateRecipe />} />
          <Route path='searchRecipes' element={<SearchRecipes />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;