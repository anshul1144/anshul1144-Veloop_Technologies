import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./MergeMaster.module.css";

const TILE_COLORS = {
  2: "#ede9fe",
  4: "#ddd6fe",
  8: "#c4b5fd",
  16: "#a78bfa",
  32: "#8b5cf6",
  64: "#7c3aed",
  128: "#6d28d9",
  256: "#5b21b6",
  512: "#f59e0b",
  1024: "#e11d48",
  2048: "#10b981"
};

export default function MergeMasterGame({ game, onFinishGame, onBack }) {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 4, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const touchStartRef = useRef(null);

  // Spawn random tile (2 or 4)
  const spawnTile = (currentBoard) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const val = Math.random() > 0.1 ? 2 : 4;
    const next = currentBoard.map((row) => [...row]);
    next[choice.r][choice.c] = val;
    return next;
  };

  // Slide & Merge logic
  const move = (direction) => {
    if (isGameOver) return;
    let moved = false;
    let earned = 0;
    let b = board.map((row) => [...row]);

    const rotate = (m) => m[0].map((_, i) => m.map((row) => row[i]).reverse());

    if (direction === "left") {
      // standard slide
    } else if (direction === "down") {
      b = rotate(b);
    } else if (direction === "right") {
      b = rotate(rotate(b));
    } else if (direction === "up") {
      b = rotate(rotate(rotate(b)));
    }

    // Process each row sliding to left
    for (let r = 0; r < 4; r++) {
      let filtered = b[r].filter((v) => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          earned += filtered[i];
          filtered.splice(i + 1, 1);
          if (filtered[i] === 2048) {
            setTokensWon((t) => t + 10);
            if (soundEnabled) arcadeAudio.playWin();
          }
        }
      }
      while (filtered.length < 4) filtered.push(0);
      if (filtered.some((v, idx) => v !== b[r][idx])) moved = true;
      b[r] = filtered;
    }

    // Rotate back
    if (direction === "left") {
    } else if (direction === "down") {
      b = rotate(rotate(rotate(b)));
    } else if (direction === "right") {
      b = rotate(rotate(b));
    } else if (direction === "up") {
      b = rotate(b);
    }

    if (moved) {
      if (soundEnabled) arcadeAudio.playPop();
      if (earned > 0) {
        setScore((s) => s + earned);
        if (soundEnabled) arcadeAudio.playScore();
      }
      const newB = spawnTile(b);
      setBoard(newB);

      // Check if board full and no moves available
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (newB[r][c] === 0) canMove = true;
          if (c < 3 && newB[r][c] === newB[r][c + 1]) canMove = true;
          if (r < 3 && newB[r][c] === newB[r + 1][c]) canMove = true;
        }
      }

      if (!canMove) {
        if (soundEnabled) arcadeAudio.playDefeat();
        setGameOverReason("No valid merges remaining on grid!");
        setIsGameOver(true);
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") move("left");
      if (e.key === "ArrowRight" || e.key === "d") move("right");
      if (e.key === "ArrowUp" || e.key === "w") move("up");
      if (e.key === "ArrowDown" || e.key === "s") move("down");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, isGameOver]);

  // Touch Swipe handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (dx > 0) move("right");
      else move("left");
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 30) {
      if (dy > 0) move("down");
      else move("up");
    }
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 600) return 30;
    if (pts >= 300) return 18;
    return 8;
  };

  return (
    <div className={styles.gameContainer}>
      <header className={styles.hud}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Exit
        </button>
        <div className={styles.statsRow}>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#a855f7" />
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
        <div
          className={styles.board}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={styles.cell}
                style={{
                  backgroundColor: val ? TILE_COLORS[val] || "#10b981" : "rgba(255,255,255,0.08)",
                  color: val > 4 ? "#ffffff" : "#4c1d95"
                }}
              >
                {val > 0 ? val : ""}
              </div>
            ))
          )}
        </div>

        {/* On-screen D-Pad for Mobile & Desktop */}
        <div className={styles.dPad}>
          <div />
          <button className={styles.dBtn} onClick={() => move("up")}><ChevronUp size={24} /></button>
          <div />
          <button className={styles.dBtn} onClick={() => move("left")}><ChevronLeft size={24} /></button>
          <button className={styles.dBtn} onClick={() => move("down")}><ChevronDown size={24} /></button>
          <button className={styles.dBtn} onClick={() => move("right")}><ChevronRight size={24} /></button>
        </div>

        <p className={styles.prompt}>SWIPE OR USE ARROWS TO SLIDE & MERGE NUMBERS TO 2048!</p>
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
          // clear lowest tiles to make space
          setBoard([
            [0, 0, 0, 0],
            [0, 16, 32, 0],
            [0, 64, 128, 0],
            [0, 0, 0, 0]
          ]);
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setIsGameOver(false);
          setBoard([
            [0, 0, 0, 0],
            [0, 2, 0, 0],
            [0, 0, 4, 0],
            [0, 0, 0, 0]
          ]);
        }}
      />
    </div>
  );
}
