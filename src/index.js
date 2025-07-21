import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Star from "./star";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <Star max={10} />
    <Star />*/}
  </React.StrictMode>
);
