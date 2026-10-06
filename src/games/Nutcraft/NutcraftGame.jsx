import React, { useState, useEffect } from "react";
import { ArrowLeft, Volume2, VolumeX, AlertTriangle, Sparkles } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./Nutcraft.module.css";

export default function NutcraftGame({ game, onFinishGame, onBack }) {
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);
  const [selectedBoltId, setSelectedBoltId] = useState(null);
  const [mistakeBanner, setMistakeBanner] = useState(null);

  // Puzzle state: holes, bolts, and wooden plates
  const [holes, setHoles] = useState([
    { id: 1, x: 70, y: 100 },
    { id: 2, x: 190, y: 100 },
    { id: 3, x: 310, y: 100 },
    { id: 4, x: 130, y: 220 },
    { id: 5, x: 250, y: 220 },
    { id: 6, x: 190, y: 340 },
    { id: 7, x: 70, y: 400 }, // vacant hole 1
    { id: 8, x: 310, y: 400 } // vacant hole 2
  ]);

  const [bolts, setBolts] = useState([
    { id: "b1", holeId: 1, color: "#ef4444" },
    { id: "b2", holeId: 2, color: "#3b82f6" },
    { id: "b3", holeId: 3, color: "#10b981" },
    { id: "b4", holeId: 4, color: "#f59e0b" },
    { id: "b5", holeId: 5, color: "#8b5cf6" },
    { id: "b6", holeId: 6, color: "#ec4899" }
  ]);

  const [plates, setPlates] = useState([
    { id: "p1", requiredHoles: [1, 2], fallen: false, width: 220, height: 44, x: 70, y: 80, bg: "#b45309" },
    { id: "p2", requiredHoles: [2, 3], fallen: false, width: 220, height: 44, x: 190, y: 80, bg: "#d97706" },
    { id: "p3", requiredHoles: [4, 5], fallen: false, width: 200, height: 40, x: 120, y: 200, bg: "#92400e" },
    { id: "p4", requiredHoles: [6], fallen: false, width: 80, height: 80, x: 150, y: 300, bg: "#78350f" }
  ]);

  const handleBoltClick = (boltId) => {
    if (isGameOver) return;
    if (selectedBoltId === boltId) {
      setSelectedBoltId(null);
    } else {
      setSelectedBoltId(boltId);
      if (soundEnabled) arcadeAudio.playTap();
    }
  };

  const handleHoleClick = (holeId) => {
    if (isGameOver || !selectedBoltId) return;

    // Check if hole is already occupied by a bolt
    const occupied = bolts.some((b) => b.holeId === holeId);
    if (occupied) {
      if (soundEnabled) arcadeAudio.playDefeat();
      setMistakeBanner("Hole already blocked!");
      setTimeout(() => setMistakeBanner(null), 1500);
      return;
    }

    // Move bolt to new hole
    const newBolts = bolts.map((b) => (b.id === selectedBoltId ? { ...b, holeId } : b));
    setBolts(newBolts);
    setSelectedBoltId(null);
    if (soundEnabled) arcadeAudio.playPop();

    // Check if any plate has had all its bolts removed
    let newlyFallen = 0;
    const updatedPlates = plates.map((p) => {
      if (p.fallen) return p;
      // Are all required holes empty of bolts?
      const hasHoldingBolt = p.requiredHoles.some((rId) => newBolts.some((b) => b.holeId === rId));
      if (!hasHoldingBolt) {
        newlyFallen++;
        return { ...p, fallen: true };
      }
      return p;
    });

    if (newlyFallen > 0) {
      setPlates(updatedPlates);
      const points = newlyFallen * 100;
      setScore((s) => s + points);
      if (soundEnabled) arcadeAudio.playScore();

      // Check if all plates have fallen (Level Win!)
      const allDone = updatedPlates.every((p) => p.fallen);
      if (allDone) {
        if (soundEnabled) arcadeAudio.playWin();
        setTokensWon((t) => t + 5);
        setStage((st) => st + 1);
        setTimeout(() => {
          // Reset for next harder stage
          setPlates(plates.map((p) => ({ ...p, fallen: false })));
        }, 1200);
      }
    }
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 300) return 25;
    if (pts >= 150) return 15;
    return 8;
  };

  return (
    <div className={styles.gameContainer}>
      <header className={styles.hud}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Exit
        </button>
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>STAGE</span>
            <span className={styles.statValue}>{stage}</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#f59e0b" />
              <span className={styles.statValue}>+{tokensWon} Tokens</span>
            </div>
          )}
          <button
            className={styles.soundBtn}
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              arcadeAudio.enabled = !soundEnabled;
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      <div className={styles.gameArea}>
        <div className={styles.board}>
          {/* Wooden Plates */}
          {plates.map((plate) => (
            <div
              key={plate.id}
              className={`${styles.plate} ${plate.fallen ? styles.plateFalling : ""}`}
              style={{
                width: `${plate.width}px`,
                height: `${plate.height}px`,
                left: `${plate.x}px`,
                top: `${plate.y}px`,
                backgroundColor: plate.bg
              }}
            />
          ))}

          {/* Holes */}
          {holes.map((hole) => {
            const hasBolt = bolts.some((b) => b.holeId === hole.id);
            return (
              <div
                key={hole.id}
                className={`${styles.hole} ${!hasBolt && selectedBoltId ? styles.holeVacant : ""}`}
                style={{ left: `${hole.x}px`, top: `${hole.y}px` }}
                onClick={() => handleHoleClick(hole.id)}
              />
            );
          })}

          {/* Bolts */}
          {bolts.map((bolt) => {
            const hole = holes.find((h) => h.id === bolt.holeId);
            if (!hole) return null;
            const isSelected = selectedBoltId === bolt.id;
            return (
              <div
                key={bolt.id}
                className={`${styles.bolt} ${isSelected ? styles.boltSelected : ""}`}
                style={{
                  left: `${hole.x}px`,
                  top: `${hole.y}px`,
                  backgroundColor: bolt.color
                }}
                onClick={() => handleBoltClick(bolt.id)}
              >
                <div className={styles.boltInner} />
              </div>
            );
          })}
        </div>

        <p className={styles.instructionsPrompt}>
          TAP A BOLT TO UNSCREW • PLACE IN EMPTY HOLE TO DROP WOODEN PLATES!
        </p>

        {mistakeBanner && (
          <div className={styles.mistakeBanner}>
            <AlertTriangle size={18} />
            <span>{mistakeBanner}</span>
          </div>
        )}
      </div>

      <GameOverModal
        isOpen={isGameOver}
        score={score}
        earnedCoins={calculateEarnedCoins(score)}
        earnedTokens={tokensWon}
        reason={gameOverReason}
        isMistake={true}
        canRevive={reviveCount < 1}
        reviveCount={reviveCount}
        maxRevives={1}
        onRevive={() => {
          setReviveCount(1);
          setIsGameOver(false);
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setStage(1);
          setIsGameOver(false);
          setPlates(plates.map((p) => ({ ...p, fallen: false })));
        }}
      />
    </div>
  );
}
