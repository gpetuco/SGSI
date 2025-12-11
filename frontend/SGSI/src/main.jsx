import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

try {
  const html = document.documentElement;
  if (!html.classList.contains("dark")) html.classList.add("dark");
  localStorage.setItem("theme", "dark");
  // eslint-disable-next-line no-empty
} catch (_) {}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
