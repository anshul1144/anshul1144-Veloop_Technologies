import React from "react";
import { Heart, Trophy, Sparkles, RotateCcw, Home } from "lucide-react";
import styles from "./GameOverModal.module.css";

export default function GameOverModal({
  isOpen,
  score,
  earnedCoins,
  canRevive = true,
  reviveCount = 0,
  maxRevives = 2,
  onRevive,
  onNoThanks
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="gameOverTitle">
        {/* Crown / Trophy Banner */}
        <div className={styles.iconCircle}>
          <Trophy size={36} className={styles.trophyIcon} />
        </div>

        <h2 id="gameOverTitle" className={styles.title}>
          GAME OVER
        </h2>

        {/* Score Summary */}
        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Final Score</span>
            <span className={styles.scoreValue}>{score}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Earned Game Coins</span>
            <div className={styles.coinReward}>
              <img src="/assets/game-coin.png" alt="Game Coin" className={styles.coinIcon} />
              <span className={styles.coinValue}>+{earnedCoins}</span>
            </div>
          </div>
        </div>

        {/* Revive Prompt */}
        {canRevive && reviveCount < maxRevives ? (
          <div className={styles.reviveSection}>
            <p className={styles.promptText}>
              Keep your streak alive? Revive now with an extra life!
            </p>
            <span className={styles.reviveRemaining}>
              ({maxRevives - reviveCount} revive remaining this run)
            </span>

            <button className={styles.reviveBtn} onClick={onRevive}>
              <Heart size={18} fill="#ffffff" />
              <span>REVIVE & CONTINUE</span>
            </button>
          </div>
        ) : (
          <p className={styles.promptText}>
            No more revives available for this run. Well played!
          </p>
        )}

        {/* No Thanks / Cash-in button (Section 55.25) */}
        <button className={styles.noThanksBtn} onClick={onNoThanks}>
          <Sparkles size={16} />
          <span>Collect +{earnedCoins} Coins & Return Home</span>
        </button>
      </div>
    </div>
  );
}
