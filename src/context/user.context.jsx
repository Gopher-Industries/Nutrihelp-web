import React from 'react';
import { createContext, useState } from 'react';

//The function to set the context for the logged in user
//This function will be called by the in-built react function, "userContext()"
// in order to set the current user
export const UserContext = createContext(
    {
        currentUser: null,
        setCurrentUser: () => null
    }
)

//Gives access to the values in the UserContext
export const UserProvider = ({ children }) => {
    //Set the current user
    const [currentUser, setCurrentUser] = useState(null)

    //Use destructuring to set the constant, "value"
    //to take the function, setCurrentUser, and the variable, currentUser
    const value = { currentUser, setCurrentUser }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}