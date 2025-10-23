import React from 'react'; 
// This line ensures the JSX compiler can find the 'React' object

// ... rest of your imports below this line
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  