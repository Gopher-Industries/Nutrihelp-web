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



import React, { createContext, useState, useEffect } from 'react';

// creating react context to configure logging in user
export const UserContext = createContext({
    currentUser: null,
    setCurrentUser: () => null,
    logOut: () => null,
});

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
    //    get value of current user from localstorage
        const userFromStorage = localStorage.getItem('user');
        return userFromStorage ? JSON.parse(userFromStorage) : null;
    });

    // to add the user in local storage
    const setUser = (user) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem('user', JSON.stringify(user)); 
        } else {
            localStorage.removeItem('user'); // remove storage data if there is no user
        }
    };

    const logOut = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    const value = { currentUser, setCurrentUser: setUser, logOut };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
