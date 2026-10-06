import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./Wormzy.module.css";

const GRID_SIZE = 18;
const CELL_COUNT = 20;

export default function WormzyGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    apple: { x: 15, y: 10 },
    running: true
  });

  const spawnApple = (snake) => {
    let newA;
    while (!newA || snake.some((seg) => seg.x === newA.x && seg.y === newA.y)) {
      newA = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT)
      };
    }
    return newA;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let intervalId;

    const tick = () => {
      if (!stateRef.current.running) return;

      const state = stateRef.current;
      state.dir = state.nextDir;
      const head = {
        x: state.snake[0].x + state.dir.x,
        y: state.snake[0].y + state.dir.y
      };

      // Collision with wall
      if (head.x < 0 || head.x >= CELL_COUNT || head.y < 0 || head.y >= CELL_COUNT) {
        if (soundEnabled) arcadeAudio.playDefeat();
        state.running = false;
        setGameOverReason("Wormzy collided into the boundary wall!");
        setIsGameOver(true);
        return;
      }

      // Collision with self
      if (state.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
        if (soundEnabled) arcadeAudio.playClash();
        state.running = false;
        setGameOverReason("Wormzy bit its own tail!");
        setIsGameOver(true);
        return;
      }

      const newSnake = [head, ...state.snake];

      // Eat apple?
      if (head.x === state.apple.x && head.y === state.apple.y) {
        setScore((s) => s + 50);
        if (soundEnabled) arcadeAudio.playScore();
        state.apple = spawnApple(newSnake);

        // Milestone reward
        if (newSnake.length % 5 === 0) {
          setTokensWon((t) => t + 5);
          if (soundEnabled) arcadeAudio.playWin();
        }
      } else {
        newSnake.pop();
      }

      state.snake = newSnake;

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apple
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(
        state.apple.x * GRID_SIZE + GRID_SIZE / 2,
        state.apple.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Stem
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(state.apple.x * GRID_SIZE + 7, state.apple.y * GRID_SIZE + 2, 4, 3);

      // Snake body
      state.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? "#10b981" : "#059669";
        ctx.beginPath();
        ctx.roundRect(
          seg.x * GRID_SIZE + 1,
          seg.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2,
          i === 0 ? 6 : 4
        );
        ctx.fill();
      });
    };

    intervalId = setInterval(tick, 120);
    return () => clearInterval(intervalId);
  }, [soundEnabled]);

  const changeDir = (dx, dy) => {
    if (stateRef.current.dir.x !== -dx || stateRef.current.dir.y !== -dy) {
      stateRef.current.nextDir = { x: dx, y: dy };
      if (soundEnabled) arcadeAudio.playTap();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w") changeDir(0, -1);
      if (e.key === "ArrowDown" || e.key === "s") changeDir(0, 1);
      if (e.key === "ArrowLeft" || e.key === "a") changeDir(-1, 0);
      if (e.key === "ArrowRight" || e.key === "d") changeDir(1, 0);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const calculateEarnedCoins = (pts) => {
    if (pts >= 400) return 25;
    if (pts >= 200) return 15;
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
              <Sparkles size={14} color="#22c55e" />
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
        <canvas
          ref={canvasRef}
          width={CELL_COUNT * GRID_SIZE}
          height={CELL_COUNT * GRID_SIZE}
          className={styles.gameCanvas}
        />

        <div className={styles.dPad}>
          <div />
          <button className={styles.dBtn} onClick={() => changeDir(0, -1)}><ChevronUp size={24} /></button>
          <div />
          <button className={styles.dBtn} onClick={() => changeDir(-1, 0)}><ChevronLeft size={24} /></button>
          <button className={styles.dBtn} onClick={() => changeDir(0, 1)}><ChevronDown size={24} /></button>
          <button className={styles.dBtn} onClick={() => changeDir(1, 0)}><ChevronRight size={24} /></button>
        </div>

        <p className={styles.prompt}>USE D-PAD OR ARROWS TO MUNCH APPLES • DON'T HIT WALLS!</p>
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
          stateRef.current.running = true;
          stateRef.current.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 }
          ];
          stateRef.current.dir = { x: 1, y: 0 };
          stateRef.current.nextDir = { x: 1, y: 0 };
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setIsGameOver(false);
          stateRef.current.running = true;
          stateRef.current.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
          ];
          stateRef.current.dir = { x: 1, y: 0 };
          stateRef.current.nextDir = { x: 1, y: 0 };
        }}
      />
    </div>
  );
}
