import React from "react";
import { Routes, Route } from "react-router-dom";
import CommunityVacancy from "./components/Community_Vacancy_Map.js";
import Maps from "./components/Maps";
import Home from "./pages/home.js";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maps/community_vacancy" element={<CommunityVacancy />} />
      <Route path="/maps/:mapType" element={<Maps />} />
    </Routes>
  );
}

export default App;
