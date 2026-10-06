import React, { useRef, useEffect, useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, Heart } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./BlockCrush.module.css";

export default function BlockCrushGame({ game, onFinishGame, onBack }) {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(1);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const stateRef = useRef({
    paddleX: 190,
    paddleWidth: 84,
    ball: { x: 190, y: 440, vx: 4, vy: -5, radius: 7 },
    bricks: [],
    running: true
  });

  const setupBricks = (stg) => {
    const newBricks = [];
    const rows = 4 + stg;
    const cols = 6;
    const w = 48;
    const h = 18;
    const pad = 8;
    const offsetX = 24;
    const offsetY = 50;

    const colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#06b6d4", "#8b5cf6"];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newBricks.push({
          x: offsetX + c * (w + pad),
          y: offsetY + r * (h + pad),
          w,
          h,
          hits: 1,
          color: colors[r % colors.length]
        });
      }
    }
    stateRef.current.bricks = newBricks;
  };

  useEffect(() => {
    setupBricks(1);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    const loop = () => {
      if (!stateRef.current.running) return;

      const b = stateRef.current.ball;
      b.x += b.vx;
      b.y += b.vy;

      // Bounce left/right walls
      if (b.x - b.radius < 0) {
        b.x = b.radius;
        b.vx *= -1;
        if (soundEnabled) arcadeAudio.playTap();
      } else if (b.x + b.radius > canvas.width) {
        b.x = canvas.width - b.radius;
        b.vx *= -1;
        if (soundEnabled) arcadeAudio.playTap();
      }

      // Bounce ceiling
      if (b.y - b.radius < 0) {
        b.y = b.radius;
        b.vy *= -1;
        if (soundEnabled) arcadeAudio.playTap();
      }

      // Paddle collision
      const pX = stateRef.current.paddleX;
      const pW = stateRef.current.paddleWidth;
      const pY = 480;
      if (b.y + b.radius >= pY && b.y - b.radius <= pY + 12) {
        if (b.x >= pX - pW / 2 && b.x <= pX + pW / 2) {
          b.y = pY - b.radius;
          const hitOffset = (b.x - pX) / (pW / 2); // -1 to 1
          b.vx = hitOffset * 6;
          b.vy = -Math.abs(b.vy);
          if (soundEnabled) arcadeAudio.playPop();
        }
      }

      // Brick collision
      stateRef.current.bricks.forEach((brick) => {
        if (brick.hits > 0) {
          if (
            b.x + b.radius > brick.x &&
            b.x - b.radius < brick.x + brick.w &&
            b.y + b.radius > brick.y &&
            b.y - b.radius < brick.y + brick.h
          ) {
            brick.hits = 0;
            b.vy *= -1;
            setScore((s) => s + 25);
            if (soundEnabled) arcadeAudio.playScore();
          }
        }
      });

      // Check if all bricks cleared
      const remaining = stateRef.current.bricks.filter((br) => br.hits > 0).length;
      if (remaining === 0) {
        if (soundEnabled) arcadeAudio.playWin();
        setTokensWon((t) => t + 5);
        setStage((stg) => {
          const next = stg + 1;
          setupBricks(next);
          b.x = 190;
          b.y = 440;
          b.vy = -5;
          return next;
        });
      }

      // Ball fell down
      if (b.y > canvas.height + 20) {
        if (soundEnabled) arcadeAudio.playDefeat();
        setLives((prevLives) => {
          const next = prevLives - 1;
          if (next <= 0) {
            stateRef.current.running = false;
            setGameOverReason("Ball dropped past laser paddle!");
            setIsGameOver(true);
          } else {
            b.x = stateRef.current.paddleX;
            b.y = 440;
            b.vy = -5;
          }
          return next;
        });
      }

      // RENDER
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Bricks
      stateRef.current.bricks.forEach((brick) => {
        if (brick.hits > 0) {
          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
          ctx.fill();
        }
      });

      // Paddle
      ctx.fillStyle = "#06b6d4";
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(pX - pW / 2, 480, pW, 12, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ball
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [soundEnabled]);

  // Touch and mouse control for paddle
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const scaleX = canvas.width / rect.width;
    const x = (clientX - rect.left) * scaleX;
    stateRef.current.paddleX = Math.max(45, Math.min(canvas.width - 45, x));
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 400) return 30;
    if (pts >= 250) return 20;
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
            <span className={styles.statLabel}>STAGE</span>
            <span className={styles.statValue}>{stage}</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#06b6d4" />
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
        <p className={styles.prompt}>DRAG PADDLE TO BOUNCE BALL • SMASH ALL NEON BRICKS!</p>
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
          stateRef.current.ball.y = 440;
          stateRef.current.ball.vy = -5;
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setLives(3);
          setStage(1);
          setIsGameOver(false);
          stateRef.current.running = true;
          setupBricks(1);
          stateRef.current.ball.y = 440;
          stateRef.current.ball.vy = -5;
        }}
      />
    </div>
  );
}
