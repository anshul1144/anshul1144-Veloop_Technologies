import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, Volume2, VolumeX, Timer, Sparkles, Trophy } from "lucide-react";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./SliceStorm.module.css";

// Web Audio sound synthesizer for fruit slicing & combos
class SliceAudio {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }
  playSwoosh() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {}
  }
  playSquish() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }
  playBomb() {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.42);
    } catch (e) {}
  }
  playCombo() {
    this.init();
    if (!this.ctx) return;
    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.06);
        osc.stop(this.ctx.currentTime + i * 0.06 + 0.16);
      });
    } catch (e) {}
  }
}

const sliceAudio = new SliceAudio();

const FRUIT_TYPES = [
  { name: "Watermelon", radius: 30, color: "#10b981", innerColor: "#ef4444", points: 10 },
  { name: "Pineapple", radius: 28, color: "#eab308", innerColor: "#fef08a", points: 15 },
  { name: "Orange", radius: 24, color: "#f97316", innerColor: "#ffedd5", points: 10 },
  { name: "Apple", radius: 25, color: "#dc2626", innerColor: "#fecaca", points: 12 },
  { name: "Strawberry", radius: 20, color: "#f43f5e", innerColor: "#ffe4e6", points: 8 }
];

export default function SliceStormGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [lives, setLives] = useState(3);
  const [reviveCount, setReviveCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [comboBanner, setComboBanner] = useState(null);

  // Active game animation refs
  const stateRef = useRef({
    fruits: [],
    halves: [],
    particles: [],
    splatters: [],
    bladePoints: [], // [{x, y, time}]
    isMouseDown: false,
    lastSpawnTime: 0,
    currentCombo: 0,
    comboTimer: null,
    running: true
  });

  const calculateEarnedCoins = (finalScore) => {
    if (finalScore >= 350) return 30;
    if (finalScore >= 200) return 20;
    if (finalScore >= 100) return 15;
    return 5;
  };

  // Timer countdown
  useEffect(() => {
    if (isGameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stateRef.current.running = false;
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, timeLeft]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    stateRef.current.running = true;

    let animId;
    let lastTime = performance.now();

    const spawnFruitOrBomb = () => {
      const isBomb = Math.random() < 0.2;
      const x = Math.random() * (canvas.width - 120) + 60;
      const vx = (Math.random() - 0.5) * 120;
      const vy = -(Math.random() * 200 + 450); // Shoot upward

      if (isBomb) {
        stateRef.current.fruits.push({
          isBomb: true,
          x,
          y: canvas.height + 20,
          vx,
          vy,
          gravity: 520,
          radius: 22,
          rotation: 0,
          rotSpeed: (Math.random() - 0.5) * 4
        });
      } else {
        const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
        stateRef.current.fruits.push({
          isBomb: false,
          type,
          x,
          y: canvas.height + 20,
          vx,
          vy,
          gravity: 520,
          radius: type.radius,
          rotation: 0,
          rotSpeed: (Math.random() - 0.5) * 5
        });
      }
    };

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      // Fruit Spawning Logic
      if (timestamp - stateRef.current.lastSpawnTime > 1100) {
        stateRef.current.lastSpawnTime = timestamp;
        const count = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          setTimeout(spawnFruitOrBomb, i * 200);
        }
      }

      // Update Fruits
      stateRef.current.fruits.forEach((f) => {
        f.vy += f.gravity * dt;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rotation += f.rotSpeed * dt;
      });

      // Filter out fruits that fell below canvas
      stateRef.current.fruits = stateRef.current.fruits.filter(
        (f) => f.y < canvas.height + 60
      );

      // Update Halves
      stateRef.current.halves.forEach((h) => {
        h.vy += h.gravity * dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.rotation += h.rotSpeed * dt;
      });
      stateRef.current.halves = stateRef.current.halves.filter(
        (h) => h.y < canvas.height + 60
      );

      // Update Particles
      stateRef.current.particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt;
        p.life -= dt;
      });
      stateRef.current.particles = stateRef.current.particles.filter((p) => p.life > 0);

      // Prune old blade trail points
      const now = performance.now();
      stateRef.current.bladePoints = stateRef.current.bladePoints.filter(
        (pt) => now - pt.time < 180
      );

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background juice splatters
      stateRef.current.splatters.forEach((s) => {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.opacity);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        s.opacity -= 0.05 * dt;
      });
      stateRef.current.splatters = stateRef.current.splatters.filter((s) => s.opacity > 0.05);

      // Draw Whole Flying Fruits & Bombs
      stateRef.current.fruits.forEach((f) => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);

        if (f.isBomb) {
          // Bomb body
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = "#1e293b";
          ctx.fill();
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Cap & Fuse
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(-4, -f.radius - 5, 8, 5);
          // Sparking fuse
          ctx.strokeStyle = "#f59e0b";
          ctx.beginPath();
          ctx.moveTo(0, -f.radius - 5);
          ctx.quadraticCurveTo(6, -f.radius - 12, 10, -f.radius - 14);
          ctx.stroke();
          // Spark star
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(10, -f.radius - 14, 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Rind / Skin
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = f.type.color;
          ctx.fill();

          // Inner flesh
          ctx.beginPath();
          ctx.arc(0, 0, f.radius - 4, 0, Math.PI * 2);
          ctx.fillStyle = f.type.innerColor;
          ctx.fill();

          // Fruit seeds or texture
          ctx.fillStyle = "#0f172a";
          [-5, 0, 5].forEach((offset) => {
            ctx.beginPath();
            ctx.arc(offset, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        ctx.restore();
      });

      // Draw Sliced Halves
      stateRef.current.halves.forEach((h) => {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rotation);

        ctx.beginPath();
        if (h.isLeft) {
          ctx.arc(0, 0, h.radius, Math.PI / 2, (Math.PI * 3) / 2);
        } else {
          ctx.arc(0, 0, h.radius, (Math.PI * 3) / 2, Math.PI / 2);
        }
        ctx.fillStyle = h.type.color;
        ctx.fill();

        ctx.beginPath();
        if (h.isLeft) {
          ctx.arc(0, 0, h.radius - 3, Math.PI / 2, (Math.PI * 3) / 2);
        } else {
          ctx.arc(0, 0, h.radius - 3, (Math.PI * 3) / 2, Math.PI / 2);
        }
        ctx.fillStyle = h.type.innerColor;
        ctx.fill();

        ctx.restore();
      });

      // Draw Particles
      stateRef.current.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 5), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Glowing Blade Slash Trail
      const pts = stateRef.current.bladePoints;
      if (pts.length > 1) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < pts.length; i++) {
          const p1 = pts[i - 1];
          const p2 = pts[i];
          const ageRatio = (now - p2.time) / 180;
          const alpha = Math.max(0, 1 - ageRatio);
          const width = Math.max(2, (1 - ageRatio) * 10);

          // Outer glowing trail
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.75})`;
          ctx.lineWidth = width * 1.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Inner laser blade core
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (stateRef.current.running) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      stateRef.current.running = false;
    };
  }, [soundEnabled]);

  // Blade Slicing Collision Detection
  const checkBladeSlice = (x1, y1, x2, y2) => {
    let slicedInSlash = 0;
    const remaining = [];

    stateRef.current.fruits.forEach((fruit) => {
      // Distance from point (fruit.x, fruit.y) to segment (x1, y1) -> (x2, y2)
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) {
        remaining.push(fruit);
        return;
      }

      const u = Math.max(0, Math.min(1, ((fruit.x - x1) * dx + (fruit.y - y1) * dy) / (len * len)));
      const closestX = x1 + u * dx;
      const closestY = y1 + u * dy;
      const dist = Math.hypot(fruit.x - closestX, fruit.y - closestY);

      if (dist <= fruit.radius) {
        // HIT!
        if (fruit.isBomb) {
          // BOMB DETONATION!
          if (soundEnabled) sliceAudio.playBomb();

          // Red explosion sparks
          for (let i = 0; i < 35; i++) {
            stateRef.current.particles.push({
              x: fruit.x,
              y: fruit.y,
              vx: (Math.random() - 0.5) * 450,
              vy: (Math.random() - 0.5) * 450,
              color: Math.random() > 0.5 ? "#ef4444" : "#f59e0b",
              life: 0.6
            });
          }

          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              stateRef.current.running = false;
              setIsGameOver(true);
            }
            return nextL;
          });
        } else {
          // Sliced fruit!
          slicedInSlash++;
          if (soundEnabled) sliceAudio.playSquish();

          // Spawn sliced halves
          stateRef.current.halves.push(
            {
              isLeft: true,
              type: fruit.type,
              x: fruit.x - 6,
              y: fruit.y,
              vx: -160 - Math.random() * 80,
              vy: fruit.vy - 60,
              gravity: 520,
              radius: fruit.radius,
              rotation: fruit.rotation,
              rotSpeed: -5
            },
            {
              isLeft: false,
              type: fruit.type,
              x: fruit.x + 6,
              y: fruit.y,
              vx: 160 + Math.random() * 80,
              vy: fruit.vy - 60,
              gravity: 520,
              radius: fruit.radius,
              rotation: fruit.rotation,
              rotSpeed: 5
            }
          );

          // Juice splatter particles
          for (let i = 0; i < 18; i++) {
            stateRef.current.particles.push({
              x: fruit.x,
              y: fruit.y,
              vx: (Math.random() - 0.5) * 280,
              vy: (Math.random() - 0.5) * 280,
              color: fruit.type.color,
              life: 0.5
            });
          }

          // Background splatter decal
          stateRef.current.splatters.push({
            x: fruit.x,
            y: fruit.y,
            radius: Math.random() * 20 + 20,
            color: fruit.type.innerColor,
            opacity: 0.4
          });

          setScore((s) => s + fruit.type.points);
        }
      } else {
        remaining.push(fruit);
      }
    });

    stateRef.current.fruits = remaining;

    // Combo checking
    if (slicedInSlash > 0) {
      stateRef.current.currentCombo += slicedInSlash;
      clearTimeout(stateRef.current.comboTimer);

      stateRef.current.comboTimer = setTimeout(() => {
        if (stateRef.current.currentCombo >= 3) {
          // Trigger combo reward!
          const comboPts = stateRef.current.currentCombo * 10;
          setScore((s) => s + comboPts);
          if (soundEnabled) sliceAudio.playCombo();
          setComboBanner(`${stateRef.current.currentCombo}x COMBO! +${comboPts}`);
          setTimeout(() => setComboBanner(null), 1400);
        }
        stateRef.current.currentCombo = 0;
      }, 300);
    }
  };

  // Mouse & Touch events
  const handlePointerDown = (e) => {
    stateRef.current.isMouseDown = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    stateRef.current.bladePoints = [{ x, y, time: performance.now() }];
    if (soundEnabled) sliceAudio.playSwoosh();
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.isMouseDown) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const pts = stateRef.current.bladePoints;
    if (pts.length > 0) {
      const lastPt = pts[pts.length - 1];
      checkBladeSlice(lastPt.x, lastPt.y, x, y);
    }

    stateRef.current.bladePoints.push({ x, y, time: performance.now() });
  };

  const handlePointerUp = () => {
    stateRef.current.isMouseDown = false;
  };

  // Revive logic (Section 55.24)
  const handleRevive = () => {
    setLives(2);
    setTimeLeft((t) => Math.max(t, 15)); // Restore timer to at least 15s
    setReviveCount((c) => c + 1);
    setIsGameOver(false);
    stateRef.current.running = true;
  };

  // No thanks cash-in (Section 55.25)
  const handleNoThanks = () => {
    const earned = calculateEarnedCoins(score);
    onFinishGame(earned, score);
  };

  return (
    <div className={styles.gameContainer}>
      {/* Light Theme Game HUD (Section 55.6) */}
      <header className={styles.hud}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Exit Game">
          <ArrowLeft size={18} />
          <span>Exit</span>
        </button>

        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <Timer size={16} className={styles.timerIcon} />
            <span className={styles.statValue}>{timeLeft}s</span>
          </div>

          <div className={styles.statPillHighlight}>
            <Trophy size={16} />
            <span className={styles.statValue}>{score}</span>
          </div>

          <div className={styles.livesPill}>
            {[...Array(3)].map((_, i) => (
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

      {/* Main Slicing Arena Canvas */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={400}
          height={520}
          className={styles.gameCanvas}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Combo Popup Banner */}
        {comboBanner && (
          <div className={styles.comboBanner}>
            <Sparkles size={20} />
            <span>{comboBanner}</span>
          </div>
        )}

        <div className={styles.swipePrompt}>
          SWIPE OR DRAG TO SLICE FLYING FRUIT • DODGE BOMBS!
        </div>
      </div>

      {/* Game Over & Working Revive Modal */}
      <GameOverModal
        isOpen={isGameOver}
        score={score}
        earnedCoins={calculateEarnedCoins(score)}
        canRevive={reviveCount < 1}
        reviveCount={reviveCount}
        maxRevives={1}
        onRevive={handleRevive}
        onNoThanks={handleNoThanks}
      />
    </div>
  );
}
