import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./Bowlexa.module.css";

export default function BowlexaGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [ballsLeft, setBallsLeft] = useState(5);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);
  const [strikeBanner, setStrikeBanner] = useState(null);

  const stateRef = useRef({
    pendulumAngle: 0,
    pendulumSpeed: 0.045,
    ball: null, // { x, y, vx, vy, radius }
    pins: [],
    dragging: false,
    dragStart: null,
    aimLine: null,
    running: true
  });

  // Initialize pins
  const resetPins = () => {
    const newPins = [];
    const rows = 4;
    const startY = 110;
    const spacingX = 26;
    const spacingY = 24;

    let index = 0;
    for (let r = 0; r < rows; r++) {
      const count = r + 1;
      const startX = 190 - ((count - 1) * spacingX) / 2;
      for (let c = 0; c < count; c++) {
        newPins.push({
          id: index++,
          x: startX + c * spacingX,
          y: startY + (rows - 1 - r) * spacingY,
          knocked: false,
          vx: 0,
          vy: 0
        });
      }
    }
    stateRef.current.pins = newPins;
  };

  useEffect(() => {
    resetPins();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    const loop = () => {
      if (!stateRef.current.running) return;

      // Update pendulum
      stateRef.current.pendulumAngle += stateRef.current.pendulumSpeed;
      if (Math.abs(stateRef.current.pendulumAngle) > 0.6) {
        stateRef.current.pendulumSpeed *= -1;
      }

      // Update rolling ball
      if (stateRef.current.ball) {
        const b = stateRef.current.ball;
        b.x += b.vx;
        b.y += b.vy;
        b.vy *= 0.992; // friction

        // Bounce walls
        if (b.x < 50 || b.x > 330) {
          b.vx *= -0.8;
          if (soundEnabled) arcadeAudio.playTap();
        }

        // Collision with pins
        stateRef.current.pins.forEach((p) => {
          if (!p.knocked) {
            const dx = b.x - p.x;
            const dy = b.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < 26) {
              p.knocked = true;
              p.vx = (Math.random() - 0.5) * 8 + b.vx * 0.4;
              p.vy = -Math.random() * 6 - 2;
              setScore((s) => s + 30);
              if (soundEnabled) arcadeAudio.playClash();
            }
          }
        });

        // Ball reached end of alley or stopped
        if (b.y < 60 || Math.abs(b.vy) < 0.2) {
          stateRef.current.ball = null;

          // Check for Strike!
          const allKnocked = stateRef.current.pins.every((p) => p.knocked);
          if (allKnocked) {
            if (soundEnabled) arcadeAudio.playWin();
            setStrikeBanner("🔥 STRIKE! +150 BONUS");
            setScore((s) => s + 150);
            setTokensWon((t) => t + 5);
            setTimeout(() => {
              setStrikeBanner(null);
              resetPins();
            }, 1800);
          }

          setBallsLeft((prev) => {
            const nextVal = prev - 1;
            if (nextVal <= 0) {
              setTimeout(() => {
                stateRef.current.running = false;
                setGameOverReason(allKnocked ? "Alley Cleared with Epic Strikes!" : "Ran out of bowling balls!");
                setIsGameOver(true);
              }, 800);
            }
            return nextVal;
          });
        }
      }

      // Update knocked pins physics
      stateRef.current.pins.forEach((p) => {
        if (p.knocked && Math.abs(p.vx) > 0.05) {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
        }
      });

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Alley lane
      ctx.fillStyle = "#fed7aa";
      ctx.fillRect(40, 40, 300, 440);
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 300, 440);

      // Lane guide arrows
      ctx.fillStyle = "rgba(234, 88, 12, 0.4)";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const ax = 80 + i * 55;
        ctx.moveTo(ax, 320);
        ctx.lineTo(ax - 8, 335);
        ctx.lineTo(ax + 8, 335);
        ctx.fill();
      }

      // Draw pins
      stateRef.current.pins.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.knocked ? "rgba(203, 213, 225, 0.5)" : "#ffffff";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = p.knocked ? "rgba(239, 68, 68, 0.3)" : "#ef4444";
        ctx.fillRect(-8, -2, 16, 4);
        ctx.restore();
      });

      // Draw Ball if active
      if (stateRef.current.ball) {
        const b = stateRef.current.ball;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(b.x - 4, b.y - 4, 2, 0, Math.PI * 2);
        ctx.arc(b.x + 4, b.y - 4, 2, 0, Math.PI * 2);
        ctx.arc(b.x, b.y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw Pendulum Aiming Ball
        const originX = 190;
        const originY = 480;
        const length = 70;
        const ballX = originX + Math.sin(stateRef.current.pendulumAngle) * length;
        const ballY = originY - Math.cos(stateRef.current.pendulumAngle) * length;

        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(ballX, ballY);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ballX, ballY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#0f172a";
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled]);

  const handleLaunch = () => {
    if (isGameOver || stateRef.current.ball || ballsLeft <= 0) return;

    const angle = stateRef.current.pendulumAngle;
    const originX = 190;
    const originY = 480;
    const length = 70;
    const ballX = originX + Math.sin(angle) * length;
    const ballY = originY - Math.cos(angle) * length;

    stateRef.current.ball = {
      x: ballX,
      y: ballY,
      vx: Math.sin(angle) * 7,
      vy: -11
    };

    if (soundEnabled) arcadeAudio.playPop();
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 350) return 30;
    if (pts >= 200) return 18;
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
            <span className={styles.statLabel}>BALLS</span>
            <span className={styles.statValue}>{ballsLeft}</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#f97316" />
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

      <div className={styles.canvasWrapper} onClick={handleLaunch}>
        <canvas ref={canvasRef} width={380} height={520} className={styles.gameCanvas} />

        {strikeBanner && <div className={styles.strikeBanner}>{strikeBanner}</div>}

        <p className={styles.prompt}>TAP SCREEN TO RELEASE WRECKING BALL • HIT STRIKES!</p>
      </div>

      <GameOverModal
        isOpen={isGameOver}
        score={score}
        earnedCoins={calculateEarnedCoins(score)}
        earnedTokens={tokensWon}
        reason={gameOverReason}
        isMistake={false}
        canRevive={reviveCount < 1}
        reviveCount={reviveCount}
        maxRevives={1}
        onRevive={() => {
          setReviveCount(1);
          setBallsLeft(3);
          setIsGameOver(false);
          stateRef.current.running = true;
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setBallsLeft(5);
          setIsGameOver(false);
          stateRef.current.running = true;
          resetPins();
        }}
      />
    </div>
  );
}
