import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gift,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  ArrowLeft,
  X,
  Gamepad2
} from "lucide-react";
import confetti from "canvas-confetti";
import { redemptionOptions } from "../data/gamesData";
import { useGameCoins } from "../context/GameCoinContext";
import BottomNav from "../components/layout/BottomNav";
import styles from "./Redeem.module.css";

export default function Redeem() {
  const navigate = useNavigate();
  const {
    gameCoins,
    ve,
    sve,
    gems,
    tokens,
    spins,
    redemptionHistory,
    redeemReward
  } = useGameCoins();

  const [selectedOption, setSelectedOption] = useState(null);
  const [insufficientModal, setInsufficientModal] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Trigger redemption dialog
  const handleInitiateRedeem = (opt) => {
    if (gameCoins < opt.costCoins) {
      setInsufficientModal({
        option: opt,
        deficit: opt.costCoins - gameCoins
      });
      return;
    }
    setSelectedOption(opt);
  };

  // Confirm redemption (Section 55.33)
  const handleConfirmRedeem = () => {
    if (!selectedOption) return;

    const res = redeemReward(selectedOption.id);
    if (res.success) {
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSuccessToast({
        title: "Redemption Successful!",
        desc: `Converted ${selectedOption.costCoins} Game Coins into ${selectedOption.rewardAmount} ${selectedOption.rewardUnit}!`
      });
      setSelectedOption(null);

      setTimeout(() => setSuccessToast(null), 5000);
    }
  };

  return (
    <main className={styles.main}>
      {/* Top Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/")}
            aria-label="Back to all games"
          >
            <ArrowLeft size={18} />
            <span>Games Hub</span>
          </button>

          <div className={styles.titleGroup}>
            <div className={styles.badge}>
              <Gift size={13} /> VELOOP CONVERSION CENTER
            </div>
            <h1 className={styles.title}>Redeem Game Coins</h1>
            <p className={styles.subtitle}>
              Convert your hard-won Game Coins into premium platform currencies and vouchers!
            </p>
          </div>

          {/* Centralized Balance Showcase (Section 55.31) */}
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>YOUR CENTRAL BALANCE</span>
            <div className={styles.balanceRow}>
              <img
                src="/assets/game-coin.png"
                alt="Game Coin"
                className={styles.balanceCoinImg}
              />
              <span className={styles.balanceVal}>{gameCoins}</span>
              <span className={styles.balanceUnit}>Game Coins</span>
            </div>
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successToast && (
        <div className={styles.toastContainer}>
          <div className={styles.successToast}>
            <CheckCircle2 size={24} className={styles.toastIcon} />
            <div>
              <div className={styles.toastTitle}>{successToast.title}</div>
              <div className={styles.toastDesc}>{successToast.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Currencies Portfolio Summary */}
      <section className={styles.portfolioSection}>
        <div className={styles.portfolioGrid}>
          <div className={styles.portItem}>
            <img src="/assets/rewards/ve.png" alt="VEs" className={styles.portIcon} />
            <span className={styles.portVal}>{ve}</span>
            <span className={styles.portLabel}>VEs</span>
          </div>
          <div className={styles.portItem}>
            <img src="/assets/rewards/sve.png" alt="SVEs" className={styles.portIcon} />
            <span className={styles.portVal}>{sve}</span>
            <span className={styles.portLabel}>SVEs</span>
          </div>
          <div className={styles.portItem}>
            <img src="/assets/rewards/gems.png" alt="Gems" className={styles.portIcon} />
            <span className={styles.portVal}>{gems}</span>
            <span className={styles.portLabel}>Gems</span>
          </div>
          <div className={styles.portItem}>
            <img src="/assets/token.png" alt="Tokens" className={styles.portIcon} />
            <span className={styles.portVal}>{tokens}</span>
            <span className={styles.portLabel}>Tokens</span>
          </div>
          <div className={styles.portItem}>
            <img src="/assets/rewards/spins.png" alt="Spins" className={styles.portIcon} />
            <span className={styles.portVal}>{spins}</span>
            <span className={styles.portLabel}>Spins</span>
          </div>
        </div>
      </section>

      {/* The 5 Redemption Categories (Section 55.32) */}
      <section className={styles.optionsSection}>
        <h2 className={styles.sectionHeading}>Available Conversion Offers</h2>
        <div className={styles.optionsGrid}>
          {redemptionOptions.map((opt) => {
            const canAfford = gameCoins >= opt.costCoins;
            return (
              <div
                key={opt.id}
                className={`${styles.optionCard} ${!canAfford ? styles.lockedCard : ""}`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.optionBadge}>{opt.badge}</span>
                  <div className={styles.costBadge}>
                    <img
                      src="/assets/game-coin.png"
                      alt="Game Coin"
                      className={styles.microCoin}
                    />
                    <span>{opt.costCoins} Coins</span>
                  </div>
                </div>

                <div className={styles.iconPreviewBox}>
                  <img src={opt.icon} alt={opt.name} className={styles.rewardImage} />
                </div>

                <h3 className={styles.optTitle}>{opt.name}</h3>
                <p className={styles.optDesc}>{opt.description}</p>

                <div className={styles.rateHighlight}>
                  <span>Conversion Rate:</span>
                  <strong>{opt.rateDesc}</strong>
                </div>

                <button
                  className={`${styles.redeemBtn} ${canAfford ? styles.canAffordBtn : styles.disabledBtn}`}
                  onClick={() => handleInitiateRedeem(opt)}
                >
                  <span>{canAfford ? "Redeem Now" : "Need More Coins"}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Redemption History Log (Section 55.35) */}
      <section className={styles.historySection}>
        <div className={styles.historyHeader}>
          <div className={styles.historyTitleRow}>
            <History size={18} className={styles.historyIcon} />
            <h2>Recent Redemption History</h2>
          </div>
          <span className={styles.historySubtitle}>Verified ledger of coin exchanges</span>
        </div>

        {redemptionHistory.length === 0 ? (
          <div className={styles.emptyHistory}>No redemption transactions recorded yet.</div>
        ) : (
          <div className={styles.historyTable}>
            {redemptionHistory.map((item) => (
              <div key={item.id} className={styles.historyRow}>
                <div className={styles.historyLeft}>
                  <CheckCircle2 size={16} className={styles.historyCheck} />
                  <div>
                    <div className={styles.historyTitle}>{item.title}</div>
                    <div className={styles.historyTime}>{item.timestamp}</div>
                  </div>
                </div>
                <div className={styles.historyRight}>
                  <span className={styles.coinsSpent}>-{item.coinsSpent} Coins</span>
                  <span className={styles.rewardEarned}>+{item.rewardEarned}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Modal (Section 55.33) */}
      {selectedOption && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedOption(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setSelectedOption(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className={styles.modalIconRing}>
              <Gift size={28} className={styles.modalGiftIcon} />
            </div>

            <h3 className={styles.modalTitle}>Redeem Game Coins?</h3>
            <p className={styles.modalSub}>
              Confirm your currency exchange for <strong>{selectedOption.name}</strong>.
            </p>

            <div className={styles.modalSummaryBox}>
              <div className={styles.summaryItem}>
                <span>You are converting:</span>
                <div className={styles.summaryCoin}>
                  <img src="/assets/game-coin.png" alt="Coin" className={styles.summaryCoinIcon} />
                  <strong>{selectedOption.costCoins} Game Coins</strong>
                </div>
              </div>

              <div className={styles.summaryItem}>
                <span>You will receive:</span>
                <strong className={styles.rewardHighlight}>
                  +{selectedOption.rewardAmount} {selectedOption.rewardUnit}
                </strong>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryItem}>
                <span>Remaining Balance:</span>
                <span className={styles.remainingVal}>
                  {gameCoins - selectedOption.costCoins} Game Coins
                </span>
              </div>
            </div>

            <div className={styles.modalBtnRow}>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmRedeem}
              >
                Confirm Redemption
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setSelectedOption(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Game Coins Modal (Section 55.34) */}
      {insufficientModal && (
        <div className={styles.modalBackdrop} onClick={() => setInsufficientModal(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setInsufficientModal(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className={styles.warnRing}>
              <AlertTriangle size={32} className={styles.warnAlertIcon} />
            </div>

            <h3 className={styles.modalTitle}>Not Enough Game Coins</h3>

            <div className={styles.deficitBox}>
              <div className={styles.deficitRow}>
                <span>You have:</span>
                <strong>{gameCoins} Game Coins</strong>
              </div>
              <div className={styles.deficitRow}>
                <span>Required for {insufficientModal.option.name}:</span>
                <strong>{insufficientModal.option.costCoins} Game Coins</strong>
              </div>
              <div className={styles.deficitRow}>
                <span>Coins Needed:</span>
                <span className={styles.deficitAmt}>+{insufficientModal.deficit} More</span>
              </div>
            </div>

            <p className={styles.keepPlayingText}>
              Keep playing games like <strong>Blade Master!</strong> and <strong>Slice Storm!</strong> to accumulate more Game Coins!
            </p>

            <button
              className={styles.playGamesBtn}
              onClick={() => {
                setInsufficientModal(null);
                navigate("/");
              }}
            >
              <Gamepad2 size={18} />
              <span>Play Games & Earn Coins</span>
            </button>
          </div>
        </div>
      )}

      {/* Global Bottom Navigation (Section 55.27) */}
      <BottomNav />
    </main>
  );
}
