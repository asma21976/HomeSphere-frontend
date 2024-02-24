import React from 'react';
import { Routes, Route } from "react-router-dom";
import Maps from './components/Maps';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/maps/:mapType" element={<Maps />} />
    </Routes>
  );
}

export default App;