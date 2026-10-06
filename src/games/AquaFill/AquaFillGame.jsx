import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./AquaFill.module.css";

export default function AquaFillGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [waterFill, setWaterFill] = useState(0); // 0 to 100%
  const [level, setLevel] = useState(1);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    lines: [], // array of { x1, y1, x2, y2 }
    currentLine: null,
    droplets: [],
    filledCount: 0,
    targetCount: 40,
    running: true
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let dropTimer = 0;

    const cup = { x: 190, y: 440, width: 80, height: 90 };

    const loop = () => {
      if (!stateRef.current.running) return;

      dropTimer++;
      // Spawn water droplet from pipe at top (x: 90, y: 40)
      if (dropTimer % 4 === 0 && dropTimer < 350) {
        stateRef.current.droplets.push({
          x: 90 + (Math.random() - 0.5) * 8,
          y: 40,
          vx: Math.random() * 0.4,
          vy: 2.5,
          radius: 4
        });
      }

      // Update droplets physics
      stateRef.current.droplets.forEach((d) => {
        d.vy += 0.18; // gravity
        d.x += d.vx;
        d.y += d.vy;

        // Collision with drawn pencil lines
        stateRef.current.lines.forEach((l) => {
          // Point to line segment distance
          const dx = l.x2 - l.x1;
          const dy = l.y2 - l.y1;
          const len = Math.hypot(dx, dy);
          if (len > 0) {
            const u = Math.max(0, Math.min(1, ((d.x - l.x1) * dx + (d.y - l.y1) * dy) / (len * len)));
            const px = l.x1 + u * dx;
            const py = l.y1 + u * dy;
            const dist = Math.hypot(d.x - px, d.y - py);
            if (dist < d.radius + 3) {
              // Bounce along line normal
              const nx = -dy / len;
              const ny = dx / len;
              d.vx = d.vx * 0.5 + nx * 2;
              d.vy = Math.min(1, -d.vy * 0.3) + ny * 2;
              d.x = px + nx * (d.radius + 3);
              d.y = py + ny * (d.radius + 3);
            }
          }
        });

        // Check if inside glass cup
        if (
          d.x > cup.x - cup.width / 2 &&
          d.x < cup.x + cup.width / 2 &&
          d.y > cup.y &&
          d.y < cup.y + cup.height
        ) {
          d.y = 999; // captured!
          stateRef.current.filledCount++;
          const pct = Math.min(100, Math.floor((stateRef.current.filledCount / stateRef.current.targetCount) * 100));
          setWaterFill(pct);

          if (stateRef.current.filledCount === stateRef.current.targetCount) {
            if (soundEnabled) arcadeAudio.playWin();
            setScore((s) => s + 200);
            setTokensWon((t) => t + 5);
            setTimeout(() => {
              setLevel((lvl) => lvl + 1);
              stateRef.current.filledCount = 0;
              stateRef.current.droplets = [];
              stateRef.current.lines = [];
              setWaterFill(0);
            }, 1200);
          }
        }
      });

      // Filter droplets fell offscreen
      stateRef.current.droplets = stateRef.current.droplets.filter((d) => d.y < canvas.height + 20);

      // Check if water ran out before filling
      if (dropTimer > 400 && stateRef.current.filledCount < stateRef.current.targetCount && stateRef.current.droplets.length === 0) {
        if (soundEnabled) arcadeAudio.playDefeat();
        stateRef.current.running = false;
        setGameOverReason("Water supply emptied before reaching fill goal!");
        setIsGameOver(true);
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Water tap / pipe
      ctx.fillStyle = "#64748b";
      ctx.fillRect(70, 20, 40, 20);
      ctx.fillRect(80, 40, 20, 10);

      // Obstacle pin
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(190, 220, 14, 0, Math.PI * 2);
      ctx.fill();

      // Drawn pencil lines
      ctx.strokeStyle = "#2563eb";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      stateRef.current.lines.forEach((l) => {
        ctx.beginPath();
        ctx.moveTo(l.x1, l.y1);
        ctx.lineTo(l.x2, l.y2);
        ctx.stroke();
      });

      if (stateRef.current.currentLine) {
        const cl = stateRef.current.currentLine;
        ctx.beginPath();
        ctx.moveTo(cl.x1, cl.y1);
        ctx.lineTo(cl.x2, cl.y2);
        ctx.stroke();
      }

      // Water droplets
      ctx.fillStyle = "#38bdf8";
      stateRef.current.droplets.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Glass Cup
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cup.x - cup.width / 2, cup.y);
      ctx.lineTo(cup.x - cup.width / 2 + 10, cup.y + cup.height);
      ctx.lineTo(cup.x + cup.width / 2 - 10, cup.y + cup.height);
      ctx.lineTo(cup.x + cup.width / 2, cup.y);
      ctx.stroke();

      // Water inside cup
      const fillHeight = (waterFill / 100) * cup.height;
      if (fillHeight > 0) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.7)";
        ctx.fillRect(
          cup.x - cup.width / 2 + 10,
          cup.y + cup.height - fillHeight,
          cup.width - 20,
          fillHeight
        );
      }

      // Smiling face on cup
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(cup.x - 12, cup.y + 40, 3, 0, Math.PI * 2);
      ctx.arc(cup.x + 12, cup.y + 40, 3, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(cup.x, cup.y + 45, 12, 0.2, Math.PI - 0.2);
      ctx.stroke();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled, waterFill]);

  // Touch and Mouse line drawing
  const handlePointerDown = (e) => {
    if (isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    stateRef.current.currentLine = { x1: x, y1: y, x2: x, y2: y };
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.currentLine) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    stateRef.current.currentLine.x2 = x;
    stateRef.current.currentLine.y2 = y;
  };

  const handlePointerUp = () => {
    if (stateRef.current.currentLine) {
      stateRef.current.lines.push({ ...stateRef.current.currentLine });
      stateRef.current.currentLine = null;
      if (soundEnabled) arcadeAudio.playPop();
    }
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 350) return 25;
    if (pts >= 180) return 15;
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
            <span className={styles.statLabel}>FILL</span>
            <span className={styles.statValue}>{waterFill}%</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>LEVEL</span>
            <span className={styles.statValue}>{level}</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#0284c7" />
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
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
        <p className={styles.prompt}>DRAG TO DRAW PENCIL LINES • GUIDE WATER DROPLETS INTO CUP!</p>
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
          stateRef.current.droplets = [];
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setWaterFill(0);
          setLevel(1);
          setIsGameOver(false);
          stateRef.current.running = true;
          stateRef.current.droplets = [];
          stateRef.current.lines = [];
        }}
      />
    </div>
  );
}
