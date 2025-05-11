// import React from 'react';
// import { createContext, useState } from 'react';

// //The function to set the context for the logged in user
// //This function will be called by the in-built react function, "userContext()"
// // in order to set the current user
// export const UserContext = createContext(
//     {
//         currentUser: null,
//         setCurrentUser: () => null
//     }
// )

// //Gives access to the values in the UserContext
// export const UserProvider = ({ children }) => {
//     //Set the current user
//     const [currentUser, setCurrentUser] = useState(null)

//     //Use destructuring to set the constant, "value"
//     //to take the function, setCurrentUser, and the variable, currentUser
//     const value = { currentUser, setCurrentUser }

//     return (
//         <UserContext.Provider value={value}>
//             {children}
//         </UserContext.Provider>
//     )
// }



// import React, { createContext, useState, useEffect } from 'react';

// // creating react context to configure logging in user
// export const UserContext = createContext({
//     currentUser: null,
//     setCurrentUser: () => null,
//     logOut: () => null,
// });

// export const UserProvider = ({ children }) => {
//     const [currentUser, setCurrentUser] = useState(() => {
//     //    get value of current user from localstorage
//         const userFromStorage = localStorage.getItem('user');
//         return userFromStorage ? JSON.parse(userFromStorage) : null;
//     });

//     // to add the user in local storage
//     const setUser = (user) => {
//         setCurrentUser(user);
//         if (user) {
//             localStorage.setItem('user', JSON.stringify(user)); 
//         } else {
//             localStorage.removeItem('user'); // remove storage data if there is no user
//         }
//     };

//     const logOut = () => {
//         localStorage.removeItem('user');
//         setCurrentUser(null);
//     };

//     const value = { currentUser, setCurrentUser: setUser, logOut };

//     return (
//         <UserContext.Provider value={value}>
//             {children}
//         </UserContext.Provider>
//     );
// };

import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({
    currentUser: null,
    setCurrentUser: () => null,
    logOut: () => null,
});

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        const storedExpirationTime = localStorage.getItem('expirationTime');

        if (storedUser && storedExpirationTime) {
            const expirationTime = JSON.parse(storedExpirationTime);
            if (Date.now() > expirationTime) {
                localStorage.removeItem('user');
                localStorage.removeItem('expirationTime');
                return null;
            }
            return JSON.parse(storedUser);
        }
        return null;
    });

    // Automatically log out when the token expires
    useEffect(() => {
        if (currentUser) {
            const storedExpirationTime = localStorage.getItem('expirationTime');
            if (storedExpirationTime) {
                const timeout = JSON.parse(storedExpirationTime) - Date.now();
                const logoutTimer = setTimeout(() => logOut(), timeout);
                return () => clearTimeout(logoutTimer);
            }
        }
    }, [currentUser]);

    const setUser = (user, expirationTimeInMillis) => {
        if (user) {
            setCurrentUser(user);
            const expirationTime = Date.now() + expirationTimeInMillis;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('expirationTime', JSON.stringify(expirationTime));
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('expirationTime');
        }
    };

    const logOut = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('expirationTime'); // <-- Fixed here
        setCurrentUser(null);
    };

    const value = { currentUser, setCurrentUser: setUser, logOut };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
