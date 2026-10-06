import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GameCoinProvider } from "./context/GameCoinContext";
import Navbar from "./components/layout/Navbar";
import GamesHub from "./pages/GamesHub";
import GameHome from "./pages/GameHome";
import Redeem from "./pages/Redeem";

export default function App() {
  return (
    <GameCoinProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<GamesHub />} />
            <Route path="/games/:id" element={<GameHome />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GameCoinProvider>
  );
}
