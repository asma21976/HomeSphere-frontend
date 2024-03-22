import React from "react";
import { Routes, Route } from "react-router-dom";
import Maps from "./components/Maps";
import Home from "./pages/home.js";
import MLMap from "./components/MLMap";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maps/:mapType" element={<Maps />} />
      <Route path="/maps/:algorithm" element={<MLMap />} />
    </Routes>
  );
}

export default App;
