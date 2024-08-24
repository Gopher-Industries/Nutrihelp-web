import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { UserProvider } from "./context/user.context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserProvider>
    <App />
  </UserProvider>
);
