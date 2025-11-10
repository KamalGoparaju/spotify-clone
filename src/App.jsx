// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Player from "./components/Player";

import { songs } from "./data/songs";

export default function App() {
  // index in the `songs` array for the currently playing track
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="app">
      <Sidebar />

      <main className="content">
        <Routes>
          <Route
            path="/"
            element={<Home onSelect={(idx) => setCurrentIndex(idx)} currentIndex={currentIndex} />}
          />
          <Route path="/library" element={<Library />} />
        </Routes>
      </main>

      {/* Player lives outside routing so it's always visible */}
      <Player tracks={songs} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
    </div>
  );
}
