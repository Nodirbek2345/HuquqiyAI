import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { Providers } from "./app/providers";
import "./index.css";

// Polyfills necessary for AI libraries
if (typeof window !== 'undefined') {
    if (!(window as any).global) (window as any).global = window;
    if (!(window as any).process) (window as any).process = { env: {} };
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Providers>
            <App />
        </Providers>
    </React.StrictMode>
);
