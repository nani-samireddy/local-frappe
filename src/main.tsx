import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { AppRoutes } from "./routes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* <App /> */}
    <AppRoutes />
  </React.StrictMode>,
);
