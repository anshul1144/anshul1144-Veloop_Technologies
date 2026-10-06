import React from "react";
import { BookOpen, CheckCircle2, Play, Sparkles } from "lucide-react";
import styles from "./GameGuideModal.module.css";

export default function GameGuideModal({ game, isOpen, onConfirm }) {
  if (!isOpen || !game?.guide) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="guideTitle">
        {/* Header Artwork */}
        <div className={styles.heroArtwork}>
          <img src={game.image} alt={game.name} className={styles.heroImg} />
          <div className={styles.heroOverlay}>
            <span className={styles.guideBadge}>
              <BookOpen size={13} /> Official Game Guide
            </span>
            <h2 id="guideTitle" className={styles.gameTitle}>
              {game.guide.title || `How to Play ${game.name}`}
            </h2>
          </div>
        </div>

        {/* Step by step instructions */}
        <div className={styles.content}>
          <div className={styles.stepsList}>
            {game.guide.steps.map((step, idx) => (
              <div key={idx} className={styles.stepItem}>
                <div className={styles.stepNum}>{idx + 1}</div>
                <div className={styles.stepText}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepDesc}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Reward Preview */}
          <div className={styles.rewardBox}>
            <div className={styles.rewardHeader}>
              <Sparkles size={14} className={styles.rewardIcon} />
              <span>Potential Game Coins Rewards:</span>
            </div>
            <div className={styles.rewardChips}>
              {game.rewards?.map((r, i) => (
                <div key={i} className={styles.chip}>
                  <span className={styles.chipScore}>{r.score}</span>
                  <span className={styles.chipReward}>+{r.coins} Coins</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Gameplay button */}
          <button className={styles.gotItBtn} onClick={onConfirm}>
            <span>Got It — Start Playing!</span>
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
