import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { AppRoutes } from "./routes";
import { Toaster } from "./components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppRoutes />
		<Toaster />
	</React.StrictMode>,
);
