import React from "react";
import { Heart, Trophy, Sparkles, RotateCcw, AlertTriangle, Skull } from "lucide-react";
import styles from "./GameOverModal.module.css";

export default function GameOverModal({
  isOpen,
  score,
  earnedCoins,
  earnedTokens = 0,
  reason = "Mistake occurred during gameplay!",
  isMistake = true,
  canRevive = true,
  reviveCount = 0,
  maxRevives = 1,
  onRevive,
  onNoThanks,
  onPlayAgain
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="gameOverTitle">
        {/* Header Icon Circle: Red for Mistake / Gold for Normal */}
        <div className={isMistake ? styles.iconCircleMistake : styles.iconCircle}>
          {isMistake ? (
            <AlertTriangle size={36} className={styles.mistakeIcon} />
          ) : (
            <Trophy size={36} className={styles.trophyIcon} />
          )}
        </div>

        <h2 id="gameOverTitle" className={styles.title}>
          GAME OVER
        </h2>

        {/* Mistake banner and explanation */}
        {reason && (
          <div className={styles.mistakeCard}>
            <div className={styles.mistakeBadge}>
              <Skull size={14} />
              <span>{isMistake ? "MISTAKE OCCURRED" : "RUN CONCLUDED"}</span>
            </div>
            <p className={styles.reasonText}>{reason}</p>
          </div>
        )}

        {/* Score & Currencies Summary */}
        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Final Score</span>
            <span className={styles.scoreValue}>{score}</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Game Coins</span>
            <div className={styles.coinReward}>
              <img src="/assets/game-coin.png" alt="Game Coin" className={styles.coinIcon} />
              <span className={styles.coinValue}>+{earnedCoins}</span>
            </div>
          </div>

          {earnedTokens > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>Tokens Won</span>
                <div className={styles.coinReward}>
                  <img src="/assets/token.png" alt="Token" className={styles.coinIcon} />
                  <span className={styles.tokenWonValue}>+{earnedTokens}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Revive Section */}
        {canRevive && reviveCount < maxRevives ? (
          <div className={styles.reviveSection}>
            <p className={styles.promptText}>
              Keep your streak alive? Revive now to fix the mistake!
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
          <p className={styles.promptTextMuted}>
            No revives remaining for this run.
          </p>
        )}

        {/* Action Buttons: Try Again & Return Home */}
        <div className={`${styles.actionsGroup} ${onPlayAgain ? styles.actionsGroupDual : ""}`}>
          {onPlayAgain && (
            <button className={styles.playAgainBtn} onClick={onPlayAgain}>
              <RotateCcw size={16} />
              <span>Try Again</span>
            </button>
          )}

          <button className={styles.noThanksBtn} onClick={onNoThanks}>
            <Sparkles size={16} />
            <span>
              Collect +{earnedCoins} Coins{earnedTokens > 0 ? ` & +${earnedTokens} Tokens` : ""} & Return Home
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

