// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App'; // Create this component later

// ReactDOM.render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>,
//     document.getElementById('root')
// );

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { UserProvider } from './context/user.context';
//import { BrowserRouter } from 'react-router-dom' //Imports the router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <UserProvider>
        <App />
    </UserProvider>
);
