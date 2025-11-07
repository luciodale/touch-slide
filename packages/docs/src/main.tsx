import React from "react";
import ReactDOM from "react-dom/client";
import { SwipePaneProvider } from "@luciodale/swipe-pane";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

console.log("main");
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SwipePaneProvider>
      <App />
    </SwipePaneProvider>
  </React.StrictMode>
);
