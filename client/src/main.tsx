import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./firebase/config"; // Initialize Firebase before app rendering

createRoot(document.getElementById("root")!).render(<App />);
