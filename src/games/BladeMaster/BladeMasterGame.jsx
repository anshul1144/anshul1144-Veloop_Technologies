import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, RotateCcw, Volume2, VolumeX, Sparkles, Trophy } from "lucide-react";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./BladeMaster.module.css";

// Web Audio sound synthesizer for instant zero-latency feedback
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playThud() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }
  playClash() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {}
  }
  playSlice() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }
  playStageClear() {
    this.init();
    if (!this.ctx) return;
    try {
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.08);
        osc.stop(this.ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

export default function BladeMasterGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);

  // Game state
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [knivesLeft, setKnivesLeft] = useState(7);
  const [lives, setLives] = useState(2);
  const [reviveCount, setReviveCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active game animation state refs (avoid React re-render lag)
  const stateRef = useRef({
    logAngle: 0,
    logSpeed: 0.035,
    speedDir: 1,
    knivesOnLog: [], // angles in radians
    applesOnLog: [], // angles in radians
    flyingKnife: null, // { y, speed }
    particles: [], // sparks & wood chips
    lastTime: performance.now(),
    running: true
  });

  // Calculate earned Game Coins reward based on score
  const calculateEarnedCoins = (currentScore) => {
    if (currentScore >= 400) return 30;
    if (currentScore >= 250) return 20;
    if (currentScore >= 100) return 15;
    return 5;
  };

  // Initialize stage
  const setupStage = (stageNum) => {
    const knivesNeeded = 6 + stageNum;
    setKnivesLeft(knivesNeeded);

    // Initial pre-stuck knives for challenge
    const initialKnives = [];
    const preCount = Math.min(stageNum - 1, 3);
    for (let i = 0; i < preCount; i++) {
      initialKnives.push((Math.PI * 2 * i) / preCount + Math.random() * 0.4);
    }

    // Apples on log
    const apples = [];
    const appleCount = Math.random() > 0.4 ? 2 : 1;
    for (let i = 0; i < appleCount; i++) {
      apples.push(Math.random() * Math.PI * 2);
    }

    stateRef.current.knivesOnLog = initialKnives;
    stateRef.current.applesOnLog = apples;
    stateRef.current.logSpeed = 0.03 + stageNum * 0.006;
    stateRef.current.flyingKnife = null;
  };

  useEffect(() => {
    setupStage(1);
    stateRef.current.running = true;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Game loop
    const loop = (timestamp) => {
      const dt = (timestamp - stateRef.current.lastTime) / 1000;
      stateRef.current.lastTime = timestamp;

      // Update log rotation
      stateRef.current.logAngle += stateRef.current.logSpeed * stateRef.current.speedDir;

      // Occasionally change rotation speed or direction for realism
      if (Math.random() < 0.005) {
        stateRef.current.speedDir *= -1;
      }

      // Update flying knife
      if (stateRef.current.flyingKnife) {
        stateRef.current.flyingKnife.y -= 1100 * dt;

        // Check if knife reached log target (y <= log center Y + radius)
        const logCenterY = 160;
        const logRadius = 75;
        const hitDistance = logCenterY + logRadius - 10;

        if (stateRef.current.flyingKnife.y <= hitDistance) {
          const impactAngle = (Math.PI / 2 - stateRef.current.logAngle) % (Math.PI * 2);
          const normalizedImpact = (impactAngle + Math.PI * 2) % (Math.PI * 2);

          // Check knife collision
          let collided = false;
          const minTolerance = 0.28; // radians

          for (const angle of stateRef.current.knivesOnLog) {
            const diff = Math.abs(((normalizedImpact - angle + Math.PI) % (Math.PI * 2)) - Math.PI);
            if (diff < minTolerance) {
              collided = true;
              break;
            }
          }

          if (collided) {
            // Collision with another knife!
            if (soundEnabled) sfx.playClash();

            // Spawn collision sparks
            for (let i = 0; i < 20; i++) {
              stateRef.current.particles.push({
                x: canvas.width / 2,
                y: hitDistance,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                color: "#f59e0b",
                life: 0.5
              });
            }

            stateRef.current.flyingKnife = null;

            setLives((prevLives) => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                stateRef.current.running = false;
                setIsGameOver(true);
              }
              return newLives;
            });
          } else {
            // Success: Knife lodged in log
            if (soundEnabled) sfx.playThud();

            stateRef.current.knivesOnLog.push(normalizedImpact);

            // Wood chip particles
            for (let i = 0; i < 12; i++) {
              stateRef.current.particles.push({
                x: canvas.width / 2,
                y: hitDistance,
                vx: (Math.random() - 0.5) * 180,
                vy: (Math.random() - 0.5) * 180,
                color: "#d97706",
                life: 0.4
              });
            }

            // Check if sliced any apple
            const remainingApples = [];
            for (const aAngle of stateRef.current.applesOnLog) {
              const diff = Math.abs(((normalizedImpact - aAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
              if (diff < 0.35) {
                // Sliced apple!
                if (soundEnabled) sfx.playSlice();
                setScore((s) => s + 25);
                // Apple juice particles
                for (let i = 0; i < 15; i++) {
                  stateRef.current.particles.push({
                    x: canvas.width / 2,
                    y: hitDistance,
                    vx: (Math.random() - 0.5) * 220,
                    vy: (Math.random() - 0.5) * 220,
                    color: "#ef4444",
                    life: 0.6
                  });
                }
              } else {
                remainingApples.push(aAngle);
              }
            }
            stateRef.current.applesOnLog = remainingApples;

            setScore((s) => s + 10);
            stateRef.current.flyingKnife = null;

            setKnivesLeft((k) => {
              const next = k - 1;
              if (next <= 0) {
                // Stage cleared!
                if (soundEnabled) sfx.playStageClear();
                setScore((s) => s + 50);
                setStage((st) => {
                  const nextStage = st + 1;
                  setTimeout(() => setupStage(nextStage), 400);
                  return nextStage;
                });
                return 0;
              }
              return next;
            });
          }
        }
      }

      // Update particles
      stateRef.current.particles = stateRef.current.particles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        return p.life > 0;
      });

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = 160;
      const radius = 75;

      // Draw Rotating Log Target
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(stateRef.current.logAngle);

      // Outer bark ring
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#854d0e";
      ctx.fill();

      // Inner wood rings
      ctx.beginPath();
      ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
      ctx.fillStyle = "#b45309";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius - 20, 0, Math.PI * 2);
      ctx.fillStyle = "#d97706";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius - 38, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();

      // Bullseye center
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#78350f";
      ctx.fill();

      // Stuck Knives
      stateRef.current.knivesOnLog.forEach((angle) => {
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, radius - 10);

        // Blade stuck inside wood
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(-3, 0, 6, 26);
        // Blade tip
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(0, -6);
        ctx.lineTo(3, 0);
        ctx.fill();
        // Knife handle sticking out
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-4, 26, 8, 22);
        // Handle guard
        ctx.fillStyle = "#d97706";
        ctx.fillRect(-7, 24, 14, 3);
        ctx.restore();
      });

      // Bonus Apples
      stateRef.current.applesOnLog.forEach((aAngle) => {
        ctx.save();
        ctx.rotate(aAngle);
        ctx.translate(0, radius + 12);
        // Apple circle
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        // Leaf
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(0, -14, 4, 4);
        ctx.restore();
      });

      ctx.restore();

      // Draw Flying Knife (if in flight)
      if (stateRef.current.flyingKnife) {
        const fy = stateRef.current.flyingKnife.y;
        ctx.save();
        ctx.translate(cx, fy);

        // Blade
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(5, 12);
        ctx.lineTo(-5, 12);
        ctx.closePath();
        ctx.fill();

        // Guard
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(-8, 12, 16, 4);

        // Handle
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-4, 16, 8, 24);
        ctx.restore();
      }

      // Draw Ready Knife at Bottom
      if (!stateRef.current.flyingKnife && knivesLeft > 0) {
        ctx.save();
        ctx.translate(cx, canvas.height - 48);
        // Blade
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(5, 12);
        ctx.lineTo(-5, 12);
        ctx.closePath();
        ctx.fill();
        // Guard
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(-8, 12, 16, 4);
        // Handle
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-4, 16, 8, 24);
        ctx.restore();
      }

      // Draw Particles
      stateRef.current.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 6), 0, Math.PI * 2);
        ctx.fill();
      });

      if (stateRef.current.running) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      stateRef.current.running = false;
    };
  }, [knivesLeft, soundEnabled]);

  // Throw knife handler
  const handleThrow = () => {
    if (isGameOver || knivesLeft <= 0 || stateRef.current.flyingKnife) return;

    stateRef.current.flyingKnife = {
      y: canvasRef.current.height - 48
    };
  };

  // Keyboard Spacebar throw
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleThrow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGameOver, knivesLeft]);

  // Working Revive mechanic (Section 55.24)
  const handleRevive = () => {
    setLives(1);
    setReviveCount((c) => c + 1);
    setIsGameOver(false);
    stateRef.current.running = true;
    stateRef.current.flyingKnife = null;
    // Remove the most recently collided knife
    stateRef.current.knivesOnLog.pop();
  };

  // No Thanks cash-in (Section 55.25)
  const handleNoThanks = () => {
    const earned = calculateEarnedCoins(score);
    onFinishGame(earned, score);
  };

  return (
    <div className={styles.gameContainer} onClick={handleThrow}>
      {/* Light Theme Game HUD (Section 55.6) */}
      <header className={styles.hud} onClick={(e) => e.stopPropagation()}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Exit Game">
          <ArrowLeft size={18} />
          <span>Exit</span>
        </button>

        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>STAGE</span>
            <span className={styles.statValue}>{stage}</span>
          </div>

          <div className={styles.statPillHighlight}>
            <Trophy size={16} />
            <span className={styles.statValue}>{score}</span>
          </div>

          <div className={styles.livesPill}>
            {[...Array(2)].map((_, i) => (
              <Heart
                key={i}
                size={18}
                className={i < lives ? styles.heartActive : styles.heartLost}
                fill={i < lives ? "#ef4444" : "none"}
              />
            ))}
          </div>

          <button
            className={styles.soundBtn}
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* Main Game Stage Canvas */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={380}
          height={520}
          className={styles.gameCanvas}
        />

        {/* Knives left side indicator */}
        <div className={styles.knifeStock}>
          {[...Array(knivesLeft)].map((_, i) => (
            <div key={i} className={styles.knifeIconIndicator} />
          ))}
        </div>

        {/* Interactive tap prompt */}
        <div className={styles.tapPrompt}>
          TAP SCREEN OR HIT SPACE TO THROW
        </div>
      </div>

      {/* Game Over & Working Revive Modal */}
      <GameOverModal
        isOpen={isGameOver}
        score={score}
        earnedCoins={calculateEarnedCoins(score)}
        canRevive={lives <= 0 && reviveCount < 1}
        reviveCount={reviveCount}
        maxRevives={1}
        onRevive={handleRevive}
        onNoThanks={handleNoThanks}
      />
    </div>
  );
}
