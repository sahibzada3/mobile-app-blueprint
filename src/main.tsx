import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Flareon app initializing...");
console.log("Environment variables:", {
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  mode: import.meta.env.MODE
});

// Check if Supabase env vars are available
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error("CRITICAL: VITE_SUPABASE_URL is not defined!");
  console.error("Available env vars:", Object.keys(import.meta.env));
}

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
