import React, { useState } from "react";
import { Gift, CheckCircle2, Sparkles, X, Clock, Flame } from "lucide-react";
import confetti from "canvas-confetti";
import { useGameCoins, DAILY_LOGIN_SCHEDULE } from "../../context/GameCoinContext";
import styles from "./DailyRewardModal.module.css";

export default function DailyRewardModal({ isOpen, onClose }) {
  const {
    tokens,
    loginStreak,
    isDailyClaimable,
    claimDailyReward,
    dailySchedule = DAILY_LOGIN_SCHEDULE
  } = useGameCoins();

  const [claimedReward, setClaimedReward] = useState(null);

  if (!isOpen) return null;

  // The day index (1-7) that is currently active or next
  const activeDay = isDailyClaimable
    ? ((loginStreak % 7) + 1)
    : (loginStreak === 0 ? 1 : ((loginStreak - 1) % 7) + 1);

  const handleClaim = () => {
    if (!isDailyClaimable) return;

    const result = claimDailyReward();
    if (result.success) {
      setClaimedReward(result.reward);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setTimeout(() => {
        setClaimedReward(null);
      }, 4000);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dailyRewardsTitle"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close Modal">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className={styles.headerIcon}>
          <Gift size={32} className={styles.giftIcon} />
        </div>

        <h2 id="dailyRewardsTitle" className={styles.title}>
          Daily Login Rewards
        </h2>
        <p className={styles.subtitle}>
          Log in every day to claim free Arcade Tokens & keep playing your favorite games!
        </p>

        {/* Current Streak Indicator */}
        <div className={styles.streakBadge}>
          <Flame size={16} className={styles.flameIcon} />
          <span>Current Streak: <strong>{loginStreak} Day{loginStreak === 1 ? "" : "s"}</strong></span>
        </div>

        {/* Success Alert if just claimed */}
        {claimedReward && (
          <div className={styles.successBanner}>
            <Sparkles size={18} />
            <span>
              Claimed <strong>+{claimedReward.tokens} Tokens</strong>
              {claimedReward.coins ? ` & +${claimedReward.coins} Game Coins` : ""}!
            </span>
          </div>
        )}

        {/* 7-Day Rewards Calendar Grid */}
        <div className={styles.calendarGrid}>
          {dailySchedule.map((item) => {
            const isCompleted = !isDailyClaimable && item.day <= loginStreak;
            const isCurrent = isDailyClaimable && item.day === activeDay;
            const isPast = isDailyClaimable && item.day < activeDay;
            const isLocked = item.day > activeDay;

            return (
              <div
                key={item.day}
                className={`${styles.dayCard} ${
                  isCurrent ? styles.currentDay : ""
                } ${isCompleted || isPast ? styles.completedDay : ""} ${
                  item.day === 7 ? styles.jackpotCard : ""
                }`}
              >
                <div className={styles.dayHeader}>
                  <span>Day {item.day}</span>
                  {item.day === 7 && <span className={styles.jackpotBadge}>BIG</span>}
                </div>

                <div className={styles.rewardIconWrapper}>
                  <img src="/assets/token.png" alt="Token" className={styles.tokenImg} />
                </div>

                <div className={styles.rewardAmount}>
                  +{item.tokens}
                </div>
                <div className={styles.rewardUnit}>Tokens</div>

                {item.coins > 0 && (
                  <div className={styles.bonusCoins}>
                    +{item.coins} Coins
                  </div>
                )}

                {/* Status indicator on card */}
                {isCompleted || isPast ? (
                  <div className={styles.claimedCheck}>
                    <CheckCircle2 size={16} />
                  </div>
                ) : isCurrent ? (
                  <div className={styles.readyIndicator}>
                    READY
                  </div>
                ) : (
                  <div className={styles.lockedIndicator}>
                    LOCKED
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isDailyClaimable ? (
          <button className={styles.claimBtn} onClick={handleClaim}>
            <Sparkles size={18} />
            <span>CLAIM DAY {activeDay} REWARD NOW</span>
          </button>
        ) : (
          <div className={styles.alreadyClaimedBox}>
            <Clock size={18} />
            <span>Already claimed today! Next reward unlocks tomorrow.</span>
          </div>
        )}
      </div>
    </div>
  );
}
