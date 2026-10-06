import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./BubbleBlast.module.css";

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

export default function BubbleBlastGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [bubblesShot, setBubblesShot] = useState(0);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    grid: [], // 2D array of bubbles
    cannonAngle: 0,
    currentBubble: null,
    nextColor: COLORS[0],
    flyingBubble: null,
    running: true
  });

  const initGrid = () => {
    const grid = [];
    const rows = 5;
    const cols = 8;
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = {
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alive: true
        };
      }
    }
    stateRef.current.grid = grid;
    stateRef.current.currentBubble = {
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  };

  useEffect(() => {
    initGrid();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    const radius = 20;

    const loop = () => {
      if (!stateRef.current.running) return;

      // Update flying bubble
      if (stateRef.current.flyingBubble) {
        const fb = stateRef.current.flyingBubble;
        fb.x += fb.vx;
        fb.y += fb.vy;

        // Bounce side walls
        if (fb.x - radius < 10) {
          fb.x = 10 + radius;
          fb.vx *= -1;
          if (soundEnabled) arcadeAudio.playTap();
        } else if (fb.x + radius > canvas.width - 10) {
          fb.x = canvas.width - 10 - radius;
          fb.vx *= -1;
          if (soundEnabled) arcadeAudio.playTap();
        }

        // Hit ceiling or grid
        let collided = false;
        if (fb.y - radius <= 30) {
          collided = true;
        }

        // Check collision against existing bubbles
        const grid = stateRef.current.grid;
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].alive) {
              const bx = 30 + c * (radius * 2 + 4);
              const by = 40 + r * (radius * 2 + 2);
              const dist = Math.hypot(fb.x - bx, fb.y - by);
              if (dist < radius * 2 - 2) {
                collided = true;
                break;
              }
            }
          }
          if (collided) break;
        }

        if (collided) {
          // Snap bubble into grid
          const cIdx = Math.max(0, Math.min(7, Math.floor((fb.x - 10) / (radius * 2 + 4))));
          const rIdx = Math.max(0, Math.min(10, Math.floor((fb.y - 20) / (radius * 2 + 2))));

          if (!grid[rIdx]) grid[rIdx] = [];
          grid[rIdx][cIdx] = { color: fb.color, alive: true };

          stateRef.current.flyingBubble = null;
          stateRef.current.currentBubble = {
            color: stateRef.current.nextColor
          };
          stateRef.current.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];

          // Simple match-3 check: find adjacent matching color bubbles
          let matchCount = 0;
          for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < (grid[r] || []).length; c++) {
              if (grid[r][c] && grid[r][c].alive && grid[r][c].color === fb.color) {
                const dist = Math.hypot(r - rIdx, c - cIdx);
                if (dist <= 1.5) {
                  grid[r][c].alive = false;
                  matchCount++;
                }
              }
            }
          }

          if (matchCount >= 2) {
            setScore((s) => s + matchCount * 40);
            if (soundEnabled) arcadeAudio.playScore();

            // Check if level cleared
            const anyAlive = grid.some((row) => (row || []).some((b) => b && b.alive));
            if (!anyAlive) {
              if (soundEnabled) arcadeAudio.playWin();
              setTokensWon((t) => t + 5);
              initGrid();
            }
          } else {
            if (soundEnabled) arcadeAudio.playPop();
          }

          // Check if bubbles reached bottom
          if (rIdx >= 8) {
            if (soundEnabled) arcadeAudio.playDefeat();
            stateRef.current.running = false;
            setGameOverReason("Bubbles invaded the lower sector!");
            setIsGameOver(true);
          }
        }
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid
      const grid = stateRef.current.grid;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < (grid[r] || []).length; c++) {
          const b = grid[r][c];
          if (b && b.alive) {
            const bx = 30 + c * (radius * 2 + 4);
            const by = 40 + r * (radius * 2 + 2);
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fill();

            // Glossy highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.beginPath();
            ctx.arc(bx - 6, by - 6, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Flying Bubble
      if (stateRef.current.flyingBubble) {
        const fb = stateRef.current.flyingBubble;
        ctx.fillStyle = fb.color;
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cannon Shooter
      const cx = 190;
      const cy = 480;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(stateRef.current.cannonAngle);
      ctx.strokeStyle = "rgba(236, 72, 153, 0.6)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -50);
      ctx.stroke();
      ctx.restore();

      // Current Bubble loaded
      if (stateRef.current.currentBubble) {
        ctx.fillStyle = stateRef.current.currentBubble.color;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled]);

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const tx = (clientX - rect.left) * scaleX;
    const ty = (clientY - rect.top) * scaleY;
    const angle = Math.atan2(tx - 190, -(ty - 480));
    stateRef.current.cannonAngle = Math.max(-1.1, Math.min(1.1, angle));
  };

  const handleShoot = () => {
    if (isGameOver || stateRef.current.flyingBubble || !stateRef.current.currentBubble) return;

    const angle = stateRef.current.cannonAngle;
    stateRef.current.flyingBubble = {
      x: 190,
      y: 480,
      vx: Math.sin(angle) * 12,
      vy: -Math.cos(angle) * 12,
      color: stateRef.current.currentBubble.color
    };
    setBubblesShot((s) => s + 1);
    if (soundEnabled) arcadeAudio.playPop();
  };

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
          <div className={styles.statPill}>
            <span className={styles.statLabel}>SHOTS</span>
            <span className={styles.statValue}>{bubblesShot}</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#ec4899" />
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

      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={380}
          height={520}
          className={styles.gameCanvas}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onClick={handleShoot}
        />
        <p className={styles.prompt}>AIM & TAP TO LAUNCH BUBBLE • MATCH 3+ SAME COLORS TO POP!</p>
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
          initGrid();
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setBubblesShot(0);
          setIsGameOver(false);
          stateRef.current.running = true;
          initGrid();
        }}
      />
    </div>
  );
}
