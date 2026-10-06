import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, Heart } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./CosmoWarrior.module.css";

export default function CosmoWarriorGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    ship: { x: 190, y: 440, radius: 18 },
    lasers: [],
    enemies: [],
    stars: [],
    lastShot: 0,
    running: true
  });

  // Spawn starfield
  useEffect(() => {
    const starArr = [];
    for (let i = 0; i < 60; i++) {
      starArr.push({
        x: Math.random() * 380,
        y: Math.random() * 520,
        speed: Math.random() * 2 + 0.8,
        size: Math.random() * 2 + 0.5
      });
    }
    stateRef.current.stars = starArr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let spawnTimer = 0;

    const loop = (timestamp) => {
      if (!stateRef.current.running) return;

      // Update stars
      stateRef.current.stars.forEach((s) => {
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      // Auto-fire laser every 180ms
      if (timestamp - stateRef.current.lastShot > 180) {
        stateRef.current.lastShot = timestamp;
        stateRef.current.lasers.push({
          x: stateRef.current.ship.x,
          y: stateRef.current.ship.y - 18,
          vy: -11
        });
        if (soundEnabled) arcadeAudio.playLaser();
      }

      // Update lasers
      stateRef.current.lasers = stateRef.current.lasers.filter((l) => {
        l.y += l.vy;
        return l.y > -20;
      });

      // Spawn alien enemies
      spawnTimer++;
      if (spawnTimer % 45 === 0) {
        stateRef.current.enemies.push({
          x: Math.random() * (canvas.width - 50) + 25,
          y: -20,
          vy: Math.random() * 2 + 2,
          radius: 16,
          hp: 2,
          color: Math.random() > 0.4 ? "#f43f5e" : "#a855f7"
        });
      }

      // Update enemies
      stateRef.current.enemies.forEach((en) => {
        en.y += en.vy;

        // Collision with lasers
        stateRef.current.lasers.forEach((l) => {
          const dist = Math.hypot(l.x - en.x, l.y - en.y);
          if (dist < en.radius + 6 && en.hp > 0) {
            en.hp--;
            l.y = -100; // consume laser
            if (en.hp <= 0) {
              setScore((s) => s + 50);
              if (soundEnabled) arcadeAudio.playScore();
            }
          }
        });

        // Collision with ship
        const shipDist = Math.hypot(stateRef.current.ship.x - en.x, stateRef.current.ship.y - en.y);
        if (shipDist < stateRef.current.ship.radius + en.radius && en.hp > 0) {
          en.hp = 0;
          if (soundEnabled) arcadeAudio.playDefeat();
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              stateRef.current.running = false;
              setGameOverReason("Alien invaders penetrated your shields!");
              setIsGameOver(true);
            }
            return nextL;
          });
        }
      });

      // Filter dead/offscreen enemies
      stateRef.current.enemies = stateRef.current.enemies.filter((en) => en.hp > 0 && en.y < canvas.height + 30);

      // Wave bonus check every 500 pts
      if (score > wave * 500) {
        setWave((w) => w + 1);
        setTokensWon((t) => t + 5);
        if (soundEnabled) arcadeAudio.playWin();
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = "#ffffff";
      stateRef.current.stars.forEach((s) => {
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });

      // Lasers
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      stateRef.current.lasers.forEach((l) => {
        ctx.fillRect(l.x - 2, l.y, 4, 14);
      });
      ctx.shadowBlur = 0;

      // Enemies
      stateRef.current.enemies.forEach((en) => {
        ctx.fillStyle = en.color;
        ctx.beginPath();
        ctx.arc(en.x, en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();
        // Alien eye
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(en.x - 5, en.y - 2, 3, 0, Math.PI * 2);
        ctx.arc(en.x + 5, en.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Starfighter Ship
      const sx = stateRef.current.ship.x;
      const sy = stateRef.current.ship.y;
      ctx.fillStyle = "#6366f1";
      ctx.shadowColor = "#818cf8";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 20);
      ctx.lineTo(sx + 18, sy + 16);
      ctx.lineTo(sx, sy + 8);
      ctx.lineTo(sx - 18, sy + 16);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Thruster flame
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy + 12);
      ctx.lineTo(sx, sy + 24 + Math.random() * 6);
      ctx.lineTo(sx + 6, sy + 12);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled, score, wave]);

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    stateRef.current.ship.x = Math.max(25, Math.min(canvas.width - 25, (clientX - rect.left) * scaleX));
    stateRef.current.ship.y = Math.max(60, Math.min(canvas.height - 40, (clientY - rect.top) * scaleY));
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 600) return 30;
    if (pts >= 300) return 20;
    return 10;
  };

  return (
    <div className={styles.gameContainer}>
      <header className={styles.hud}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Exit
        </button>
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span className={styles.statValue}>{lives}</span>
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
              <Sparkles size={14} color="#6366f1" />
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
        />
        <p className={styles.prompt}>DRAG TO PILOT STARFIGHTER • AUTO-LASERS DESTROY INVADERS!</p>
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
          setLives(2);
          setIsGameOver(false);
          stateRef.current.running = true;
          stateRef.current.enemies = [];
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setLives(3);
          setWave(1);
          setIsGameOver(false);
          stateRef.current.running = true;
          stateRef.current.enemies = [];
        }}
      />
    </div>
  );
}
