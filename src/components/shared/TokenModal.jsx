import React from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { useGameCoins } from "../../context/GameCoinContext";
import styles from "./TokenModal.module.css";

export default function TokenModal({ isOpen, onClose, requiredTokens = 20 }) {
  const { tokens, addTokens } = useGameCoins();

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tokenModalTitle"
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className={styles.iconCircle}>
          <AlertCircle size={32} className={styles.warnIcon} />
        </div>

        <h3 id="tokenModalTitle" className={styles.title}>
          Not Enough Tokens
        </h3>

        <p className={styles.desc}>
          This game requires <strong>{requiredTokens} Tokens</strong> to enter.
        </p>

        <div className={styles.balanceCard}>
          <div className={styles.balanceRow}>
            <span>Your Current Balance:</span>
            <div className={styles.tokenTag}>
              <img src="/assets/token.png" alt="Token" className={styles.tokenIcon} />
              <span>{tokens} Tokens</span>
            </div>
          </div>
          <div className={styles.balanceRow}>
            <span>Tokens Needed:</span>
            <span className={styles.neededTokens}>+{Math.max(0, requiredTokens - tokens)} More</span>
          </div>
        </div>

        <div className={styles.actionRow}>
          <button
            className={styles.topUpBtn}
            onClick={() => {
              addTokens(40);
              onClose();
            }}
          >
            <Plus size={16} /> Earn / Top-up +40 Tokens
          </button>

          <button className={styles.cancelBtn} onClick={onClose}>
            Back to Games
          </button>
        </div>
      </div>
    </div>
  );
}
