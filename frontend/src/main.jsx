import React from "react";
import ReactDom from "react-dom/client";
import App from './App';

import AuthProvider from "./context/AuthContext";

ReactDom.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <App/>
    </AuthProvider>
)