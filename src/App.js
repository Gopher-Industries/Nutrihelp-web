// import React, { useContext, useEffect } from 'react';
// import PreferencesComponent from './components/pref-dis-health';
// import Login from './components/Login/Login';
// import Landing from './components/Landing';


// function App() {
//   return (
//     <div>
//       {/* <PreferencesComponent /> */}
//       <Login />
//     </div>
//   );
// }


// export default App;












// import 'semantic-ui-css/semantic.min.css'
// import './App.css';
// import { Routes, Route, Navigate } from 'react-router-dom'
// // import Login from './routes/Login/Login'
// import NavFooterAndFooterLoggedIn from './components/navigation_bars_and_footers/logged_in/NavBarAndFooterLoggedIn';
// import NavFooterAndFooterNotLoggedIn from './components/navigation_bars_and_footers/not_logged_in/NavBarAndFooterNotLoggedIn';



// function App() {

//   console.log("Check current user in App.js")

//   return (
//     <Routes>
//       {/* Define the routes under the path '/' */}
//       <Route path='/' element={<NavFooterAndFooterNotLoggedIn />}>

//         {/* Let the Login page be accessible by the path '/' alone */}
//         <Route index element={<Login />} />

//         {/* List all the possible routes of under the path '/' (below): */}
//         <Route path='landing' element={<Landing />} />
//       </Route>


//       {/* Define the routes under the path '/user' */}
//       <Route path='/user' element={<NavFooterAndFooterLoggedIn />}>

//         {/* Let the HomePage page be accessible by the path '/user' alone */}
//         <Route index element={<HomePage />} />

//         {/* List all the possible routes of under the path '/user' (below): */}
//         <Route path='landing' element={<Landing />} />
//       </Route>

//     </Routes >
//   );
// }

// export default App;














import React, { useContext, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css'
import './App.css';
// import { Routes, Route, Navigate } from 'react-router-dom'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './routes/Login/Login';
import SignUp from './routes/SignUp/SignUp';
import Landing from './components/Landing';



function App() {
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

        </Route>
      </Routes >
    </Router>
  );
}


export default App;