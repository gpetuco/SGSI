import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Force dark mode globally at app bootstrap
try {
  const html = document.documentElement;
  if (!html.classList.contains("dark")) html.classList.add("dark");
  localStorage.setItem("theme", "dark");
} catch (_) {}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
