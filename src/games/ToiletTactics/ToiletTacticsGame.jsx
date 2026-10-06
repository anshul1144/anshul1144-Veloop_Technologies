import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, ShieldAlert } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./ToiletTactics.module.css";

export default function ToiletTacticsGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [baseHealth, setBaseHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    invaders: [],
    zaps: [],
    turretAngle: 0,
    running: true
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let spawnCount = 0;

    const loop = () => {
      if (!stateRef.current.running) return;

      spawnCount++;
      // Spawn invader down lanes
      if (spawnCount % 50 === 0) {
        stateRef.current.invaders.push({
          x: Math.random() * (canvas.width - 60) + 30,
          y: -20,
          vy: Math.random() * 1.5 + 1.2,
          radius: 16,
          hp: 2,
          color: "#eab308"
        });
      }

      // Update invaders
      stateRef.current.invaders.forEach((inv) => {
        inv.y += inv.vy;

        // Reached defensive base
        if (inv.y > 440 && inv.hp > 0) {
          inv.hp = 0;
          if (soundEnabled) arcadeAudio.playDefeat();
          setBaseHealth((bh) => {
            const nextH = bh - 25;
            if (nextH <= 0) {
              stateRef.current.running = false;
              setGameOverReason("Defensive perimeter breached!");
              setIsGameOver(true);
            }
            return Math.max(0, nextH);
          });
        }
      });

      // Filter dead invaders
      stateRef.current.invaders = stateRef.current.invaders.filter((inv) => inv.hp > 0);

      // Update zaps
      stateRef.current.zaps = stateRef.current.zaps.filter((z) => {
        z.life -= 0.08;
        return z.life > 0;
      });

      // Wave progression
      if (score > wave * 400) {
        setWave((w) => w + 1);
        setTokensWon((t) => t + 5);
        if (soundEnabled) arcadeAudio.playWin();
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // City Defense Baseline
      ctx.fillStyle = "rgba(234, 179, 8, 0.2)";
      ctx.fillRect(0, 440, canvas.width, 80);
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 440);
      ctx.lineTo(canvas.width, 440);
      ctx.stroke();

      // Draw Invaders
      stateRef.current.invaders.forEach((inv) => {
        ctx.fillStyle = inv.color;
        ctx.beginPath();
        ctx.arc(inv.x, inv.y, inv.radius, 0, Math.PI * 2);
        ctx.fill();

        // Toilet bowl graphic
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(inv.x - 10, inv.y - 12, 20, 8);
        ctx.fillRect(inv.x - 6, inv.y - 4, 12, 12);
      });

      // Draw Turret at bottom center
      ctx.save();
      ctx.translate(190, 480);
      ctx.rotate(stateRef.current.turretAngle);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(-14, -14, 28, 28);
      ctx.fillStyle = "#eab308";
      ctx.fillRect(-5, -30, 10, 24);
      ctx.restore();

      // Draw Zaps
      stateRef.current.zaps.forEach((z) => {
        ctx.strokeStyle = `rgba(250, 204, 21, ${z.life})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(190, 480);
        ctx.lineTo(z.tx, z.ty);
        ctx.stroke();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled, score, wave]);

  const handleCanvasClick = (e) => {
    if (isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const tx = (clientX - rect.left) * scaleX;
    const ty = (clientY - rect.top) * scaleY;

    // Turret aims toward target
    const angle = Math.atan2(tx - 190, -(ty - 480));
    stateRef.current.turretAngle = angle;

    // Add Zap line
    stateRef.current.zaps.push({ tx, ty, life: 1 });
    if (soundEnabled) arcadeAudio.playLaser();

    // Check hit on invaders near clicked coordinates
    stateRef.current.invaders.forEach((inv) => {
      const dist = Math.hypot(inv.x - tx, inv.y - ty);
      if (dist < inv.radius + 24) {
        inv.hp--;
        if (inv.hp <= 0) {
          setScore((s) => s + 40);
          if (soundEnabled) arcadeAudio.playScore();
        }
      }
    });
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 450) return 25;
    if (pts >= 250) return 15;
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
            <ShieldAlert size={14} color="#eab308" />
            <span className={styles.statValue}>{baseHealth}%</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>WAVE</span>
            <span className={styles.statValue}>{wave}</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#eab308" />
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
          onClick={handleCanvasClick}
          onTouchStart={handleCanvasClick}
        />
        <p className={styles.prompt}>TAP INVADERS TO FIRE PLASMA BLASTS • PROTECT BASELINE!</p>
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
          setBaseHealth(60);
          setIsGameOver(false);
          stateRef.current.running = true;
          stateRef.current.invaders = [];
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setBaseHealth(100);
          setWave(1);
          setIsGameOver(false);
          stateRef.current.running = true;
          stateRef.current.invaders = [];
        }}
      />
    </div>
  );
}
