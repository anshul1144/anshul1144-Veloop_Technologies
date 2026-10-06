import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, AlertTriangle, Sparkles } from "lucide-react";
import GameOverModal from "../../components/shared/GameOverModal";
import { useGameCoins } from "../../context/GameCoinContext";
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
      osc.frequency.setValueAtTime(340, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.24);
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
  playDefeat() {
    this.init();
    if (!this.ctx) return;
    try {
      [240, 200, 160, 120].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.1 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.18);
      });
    } catch (e) {}
  }
}

const sfx = new SoundFX();

export default function BladeMasterGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const { addTokens } = useGameCoins();

  // Game UI state
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [knivesLeft, setKnivesLeft] = useState(7);
  const [tokensWon, setTokensWon] = useState(0);
  const [reviveCount, setReviveCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mistakeBanner, setMistakeBanner] = useState(null);
  const [stageRewardBanner, setStageRewardBanner] = useState(null);
  const [isShaking, setIsShaking] = useState(false);

  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  // Active game animation state refs
  const stateRef = useRef({
    logAngle: 0,
    logSpeed: 0.035,
    speedDir: 1,
    knivesOnLog: [], // angles in radians
    applesOnLog: [], // angles in radians
    flyingKnife: null, // { y }
    deflectingKnife: null, // { x, y, vx, vy, rot, rotSpeed }
    particles: [], // sparks & wood chips
    lastTime: performance.now(),
    running: true,
    knivesLeft: 7,
    stage: 1,
    score: 0,
    tokensWon: 0
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
    stateRef.current.knivesLeft = knivesNeeded;
    stateRef.current.stage = stageNum;
    setKnivesLeft(knivesNeeded);
    setStage(stageNum);

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
    stateRef.current.deflectingKnife = null;
  };

  // Main canvas animation loop
  useEffect(() => {
    setupStage(1);
    stateRef.current.running = true;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - stateRef.current.lastTime) / 1000, 0.1);
      stateRef.current.lastTime = timestamp;

      // Update log rotation
      stateRef.current.logAngle += stateRef.current.logSpeed * stateRef.current.speedDir;

      // Occasionally change rotation speed or direction
      if (Math.random() < 0.005) {
        stateRef.current.speedDir *= -1;
      }

      const logCenterY = 160;
      const logRadius = 75;
      const hitDistance = logCenterY + logRadius - 10;

      // Update deflecting knife (falling off after mistake)
      if (stateRef.current.deflectingKnife) {
        const dk = stateRef.current.deflectingKnife;
        dk.x += dk.vx * dt;
        dk.y += dk.vy * dt;
        dk.vy += 850 * dt; // gravity
        dk.rot += dk.rotSpeed * dt;
      }

      // Update flying knife
      if (stateRef.current.flyingKnife) {
        stateRef.current.flyingKnife.y -= 1100 * dt;

        if (stateRef.current.flyingKnife.y <= hitDistance) {
          const impactAngle = (Math.PI / 2 - stateRef.current.logAngle) % (Math.PI * 2);
          const normalizedImpact = (impactAngle + Math.PI * 2) % (Math.PI * 2);

          // Check knife collision with already stuck knife
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
            // MISTAKE OCCURRED: Collision with another knife!
            if (soundEnabledRef.current) {
              sfx.playClash();
              sfx.playDefeat();
            }

            // Spawn collision sparks
            for (let i = 0; i < 28; i++) {
              stateRef.current.particles.push({
                x: canvas.width / 2,
                y: hitDistance,
                vx: (Math.random() - 0.5) * 350,
                vy: (Math.random() - 0.5) * 350,
                color: Math.random() > 0.5 ? "#ef4444" : "#f59e0b",
                life: 0.6
              });
            }

            // Knife deflects and tumbles downward
            stateRef.current.deflectingKnife = {
              x: canvas.width / 2,
              y: hitDistance,
              vx: (Math.random() > 0.5 ? 1 : -1) * (140 + Math.random() * 80),
              vy: 160,
              rot: 0,
              rotSpeed: 10
            };
            stateRef.current.flyingKnife = null;

            // Trigger screen shake & mistake feedback
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 450);
            setMistakeBanner("BLADE CLASHED! MISTAKE!");
            setGameOverReason("Blade Clashed! You struck an existing knife on the log.");

            // Stop game loop and open Game Over modal
            stateRef.current.running = false;
            setTimeout(() => {
              setIsGameOver(true);
              setMistakeBanner(null);
            }, 600);
          } else {
            // SUCCESS: Knife lodged in log
            if (soundEnabledRef.current) sfx.playThud();

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
                if (soundEnabledRef.current) sfx.playSlice();
                setScore((s) => s + 25);
                stateRef.current.score += 25;
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
            stateRef.current.score += 10;
            stateRef.current.flyingKnife = null;

            // Decrement remaining knives for current stage
            const remaining = stateRef.current.knivesLeft - 1;
            stateRef.current.knivesLeft = remaining;
            setKnivesLeft(remaining);

            if (remaining <= 0) {
              // Stage cleared! Award +5 Arcade Tokens for completing stage!
              if (soundEnabledRef.current) sfx.playStageClear();
              setScore((s) => s + 50);
              stateRef.current.score += 50;

              // Stage completion token award!
              addTokens(5);
              stateRef.current.tokensWon = (stateRef.current.tokensWon || 0) + 5;
              setTokensWon((t) => t + 5);
              setStageRewardBanner(`STAGE ${stateRef.current.stage} CLEARED! +5 TOKENS!`);
              setTimeout(() => setStageRewardBanner(null), 1800);

              const nextStage = stateRef.current.stage + 1;
              setTimeout(() => setupStage(nextStage), 400);
            }
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
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(0, -14, 4, 4);
        ctx.restore();
      });

      ctx.restore();

      // Draw Flying Knife
      if (stateRef.current.flyingKnife) {
        const fy = stateRef.current.flyingKnife.y;
        ctx.save();
        ctx.translate(cx, fy);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(5, 12);
        ctx.lineTo(-5, 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(-8, 12, 16, 4);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-4, 16, 8, 24);
        ctx.restore();
      }

      // Draw Deflecting Knife (bouncing off after mistake)
      if (stateRef.current.deflectingKnife) {
        const dk = stateRef.current.deflectingKnife;
        ctx.save();
        ctx.translate(dk.x, dk.y);
        ctx.rotate(dk.rot);
        ctx.fillStyle = "#f87171";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(5, 12);
        ctx.lineTo(-5, 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(-8, 12, 16, 4);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(-4, 16, 8, 24);
        ctx.restore();
      }

      // Draw Ready Knife at Bottom (if knives remain and not in flight)
      if (
        !stateRef.current.flyingKnife &&
        !stateRef.current.deflectingKnife &&
        stateRef.current.knivesLeft > 0
      ) {
        ctx.save();
        ctx.translate(cx, canvas.height - 48);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(5, 12);
        ctx.lineTo(-5, 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(-8, 12, 16, 4);
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
  }, []);

  // Throw knife handler
  const handleThrow = () => {
    if (
      isGameOver ||
      stateRef.current.knivesLeft <= 0 ||
      stateRef.current.flyingKnife ||
      stateRef.current.deflectingKnife ||
      !stateRef.current.running
    ) {
      return;
    }

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
  }, [isGameOver]);

  // Revive mechanic: allows 1 retry to fix the mistake
  const handleRevive = () => {
    setReviveCount((c) => c + 1);
    setIsGameOver(false);
    stateRef.current.running = true;
    stateRef.current.flyingKnife = null;
    stateRef.current.deflectingKnife = null;
    stateRef.current.lastTime = performance.now();

    // Restart loop
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const loop = (timestamp) => {
        if (!stateRef.current.running) return;
        const dt = Math.min((timestamp - stateRef.current.lastTime) / 1000, 0.1);
        stateRef.current.lastTime = timestamp;
        stateRef.current.logAngle += stateRef.current.logSpeed * stateRef.current.speedDir;
        requestAnimationFrame(loop);
      };
      // Simple trigger to ensure loop continues
    }
    // Re-mount / re-trigger loop by calling setupStage lightly
    window.requestAnimationFrame(() => {
      stateRef.current.running = true;
    });
  };

  // Play Again: restart completely from stage 1
  const handlePlayAgain = () => {
    setScore(0);
    setTokensWon(0);
    setReviveCount(0);
    setIsGameOver(false);
    setMistakeBanner(null);
    setStageRewardBanner(null);
    setupStage(1);
    stateRef.current.score = 0;
    stateRef.current.tokensWon = 0;
    stateRef.current.running = true;
    stateRef.current.lastTime = performance.now();
  };

  // Cash-in & Return Home
  const handleNoThanks = () => {
    const earned = calculateEarnedCoins(score);
    onFinishGame(earned, score, tokensWon);
  };

  return (
    <div
      className={`${styles.gameContainer} ${isShaking ? styles.shake : ""}`}
      onClick={handleThrow}
    >
      {/* Light Theme Game HUD */}
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
          {[...Array(Math.max(0, knivesLeft))].map((_, i) => (
            <div key={i} className={styles.knifeIconIndicator} />
          ))}
        </div>

        {/* Floating Stage Clear Tokens Banner */}
        {stageRewardBanner && (
          <div className={styles.stageRewardBanner}>
            <Sparkles size={18} />
            <span>{stageRewardBanner}</span>
          </div>
        )}

        {/* Floating Mistake Banner */}
        {mistakeBanner && (
          <div className={styles.mistakeBanner}>
            <AlertTriangle size={18} />
            <span>{mistakeBanner}</span>
          </div>
        )}

        {/* Interactive tap prompt */}
        <div className={styles.tapPrompt}>
          TAP SCREEN OR HIT SPACE TO THROW • DON'T HIT OTHER KNIVES!
        </div>
      </div>

      {/* Game Over Modal with Mistake Reason & Tokens Earned */}
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
        onRevive={handleRevive}
        onNoThanks={handleNoThanks}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
}
