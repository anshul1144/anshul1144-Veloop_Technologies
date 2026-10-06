import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./RealmClash.module.css";

export default function RealmClashGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [elixir, setElixir] = useState(5);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    friendlyTroops: [],
    enemyTroops: [],
    playerTowerHp: 100,
    enemyTowerHp: 100,
    running: true
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let spawnTimer = 0;

    // Elixir regeneration
    const elixirInterval = setInterval(() => {
      setElixir((e) => Math.min(10, e + 1));
    }, 1400);

    const loop = () => {
      if (!stateRef.current.running) return;

      spawnTimer++;
      // AI Spawns Enemy Goblin or Skeleton occasionally
      if (spawnTimer % 120 === 0) {
        stateRef.current.enemyTroops.push({
          x: Math.random() > 0.5 ? 120 : 260,
          y: 70,
          vy: 1.2,
          hp: 40,
          maxHp: 40,
          color: "#dc2626"
        });
      }

      // Update Friendly Troops (march up)
      stateRef.current.friendlyTroops.forEach((tr) => {
        // Check combat with enemy troops
        const targetEnemy = stateRef.current.enemyTroops.find(
          (e) => Math.hypot(e.x - tr.x, e.y - tr.y) < 24
        );
        if (targetEnemy) {
          targetEnemy.hp -= 0.8;
          tr.hp -= 0.5;
        } else {
          tr.y -= tr.vy;
        }

        // Reached Enemy Tower
        if (tr.y <= 60) {
          stateRef.current.enemyTowerHp = Math.max(0, stateRef.current.enemyTowerHp - 0.6);
        }
      });

      // Update Enemy Troops (march down)
      stateRef.current.enemyTroops.forEach((en) => {
        const targetFriendly = stateRef.current.friendlyTroops.find(
          (tr) => Math.hypot(tr.x - en.x, tr.y - en.y) < 24
        );
        if (targetFriendly) {
          // Engaged in combat
        } else {
          en.y += en.vy;
        }

        // Reached Player Tower
        if (en.y >= 380) {
          stateRef.current.playerTowerHp = Math.max(0, stateRef.current.playerTowerHp - 0.5);
        }
      });

      // Filter dead troops
      stateRef.current.friendlyTroops = stateRef.current.friendlyTroops.filter((t) => t.hp > 0 && t.y > 40);
      stateRef.current.enemyTroops = stateRef.current.enemyTroops.filter((t) => t.hp > 0 && t.y < 420);

      // Check Victory / Defeat
      if (stateRef.current.enemyTowerHp <= 0) {
        if (soundEnabled) arcadeAudio.playWin();
        stateRef.current.running = false;
        setScore((s) => s + 500);
        setTokensWon((t) => t + 15);
        setGameOverReason("VICTORY! Enemy Bastion Obliterated!");
        setIsGameOver(true);
      } else if (stateRef.current.playerTowerHp <= 0) {
        if (soundEnabled) arcadeAudio.playDefeat();
        stateRef.current.running = false;
        setGameOverReason("DEFEAT: Your King Bastion fell to invaders!");
        setIsGameOver(true);
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lanes
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(80, 0, 80, canvas.height);
      ctx.fillRect(220, 0, 80, canvas.height);

      // Enemy Tower at Top
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(150, 10, 80, 45);
      // Health bar
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(150, 60, 80, 6);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(150, 60, (stateRef.current.enemyTowerHp / 100) * 80, 6);

      // Player Tower at Bottom
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(150, 395, 80, 45);
      // Health bar
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(150, 385, 80, 6);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(150, 385, (stateRef.current.playerTowerHp / 100) * 80, 6);

      // Friendly Troops
      stateRef.current.friendlyTroops.forEach((tr) => {
        ctx.fillStyle = tr.color;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemy Troops
      stateRef.current.enemyTroops.forEach((en) => {
        ctx.fillStyle = en.color;
        ctx.beginPath();
        ctx.arc(en.x, en.y, 10, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      clearInterval(elixirInterval);
    };
  }, [soundEnabled]);

  const deployTroop = (type, cost) => {
    if (isGameOver || elixir < cost) return;
    setElixir((e) => e - cost);
    if (soundEnabled) arcadeAudio.playPop();

    const laneX = Math.random() > 0.5 ? 120 : 260;
    stateRef.current.friendlyTroops.push({
      x: laneX,
      y: 360,
      vy: type === "archer" ? 2.2 : type === "wizard" ? 1.6 : 1.3,
      hp: type === "knight" ? 80 : 40,
      maxHp: type === "knight" ? 80 : 40,
      color: type === "wizard" ? "#a855f7" : type === "archer" ? "#10b981" : "#3b82f6"
    });
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 400) return 30;
    if (pts >= 200) return 20;
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
            <span className={styles.statLabel}>ELIXIR</span>
            <span className={styles.statValue}>{elixir}/10</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#ef4444" />
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
        <canvas ref={canvasRef} width={380} height={460} className={styles.gameCanvas} />

        <div className={styles.elixirBar}>
          <div className={styles.elixirFill} style={{ width: `${(elixir / 10) * 100}%` }} />
        </div>

        <div className={styles.cardBar}>
          <button
            className={styles.troopCard}
            disabled={elixir < 2}
            onClick={() => deployTroop("archer", 2)}
          >
            <span className={styles.cardIcon}>🏹</span>
            <span className={styles.cardName}>Archer</span>
            <span className={styles.cardCost}>2 Elixir</span>
          </button>
          <button
            className={styles.troopCard}
            disabled={elixir < 3}
            onClick={() => deployTroop("knight", 3)}
          >
            <span className={styles.cardIcon}>⚔️</span>
            <span className={styles.cardName}>Knight</span>
            <span className={styles.cardCost}>3 Elixir</span>
          </button>
          <button
            className={styles.troopCard}
            disabled={elixir < 4}
            onClick={() => deployTroop("wizard", 4)}
          >
            <span className={styles.cardIcon}>🧙</span>
            <span className={styles.cardName}>Wizard</span>
            <span className={styles.cardCost}>4 Elixir</span>
          </button>
        </div>

        <p className={styles.prompt}>TAP TROOP CARDS TO DEPLOY INTO LANES • DESTROY ENEMY CASTLE!</p>
      </div>

      <GameOverModal
        isOpen={isGameOver}
        score={score}
        earnedCoins={calculateEarnedCoins(score)}
        earnedTokens={tokensWon}
        reason={gameOverReason}
        isMistake={stateRef.current.playerTowerHp <= 0}
        canRevive={reviveCount < 1}
        reviveCount={reviveCount}
        maxRevives={1}
        onRevive={() => {
          setReviveCount(1);
          setIsGameOver(false);
          stateRef.current.playerTowerHp = 60;
          stateRef.current.running = true;
          stateRef.current.enemyTroops = [];
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setElixir(5);
          setIsGameOver(false);
          stateRef.current.playerTowerHp = 100;
          stateRef.current.enemyTowerHp = 100;
          stateRef.current.friendlyTroops = [];
          stateRef.current.enemyTroops = [];
          stateRef.current.running = true;
        }}
      />
    </div>
  );
}
