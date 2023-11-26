import React, { useContext, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css'
import './App.css';
// import { Routes, Route, Navigate } from 'react-router-dom'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './routes/Login/Login';
import SignUp from './routes/SignUp/SignUp';
import Landing from './components/Landing';
import ForgotPassword from './routes/ForgotPassword/ForgotPassword';



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


  return (
    <Router>
      <Routes>
        {/* Define the routes under the path '/' */}
        <Route path='/' >

          {/* Let the Login page be accessible by the path '/' alone */}
          <Route index element={<Landing />} />

          {/* List all the possible routes of under the path '/' (below): */}
          <Route path='login' element={<Login />} />
          <Route path='signUp' element={<SignUp />} />
          <Route path='forgotPassword' element={<ForgotPassword />} />

        </Route>
      </Routes >
    </Router>
  );
}


export default App;