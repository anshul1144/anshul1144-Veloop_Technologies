import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Gamepad2, Gift, Sparkles, Plus, RotateCcw } from "lucide-react";
import { useGameCoins } from "../../context/GameCoinContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { gameCoins, tokens, addTokens, setTestTokens } = useGameCoins();
  const location = useLocation();
  const [showTokenMenu, setShowTokenMenu] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand */}
        <Link to="/" className={styles.brand}>
          <div className={styles.logoIcon}>
            <Gamepad2 size={24} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>VELOOP</span>
            <span className={styles.brandSub}>GAMES & REWARDS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className={styles.navLinks}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === "/" ? styles.active : ""}`}
          >
            <Gamepad2 size={16} />
            <span>Games</span>
          </Link>
          <Link
            to="/redeem"
            className={`${styles.navLink} ${location.pathname === "/redeem" ? styles.active : ""}`}
          >
            <Gift size={16} />
            <span>Redeem Center</span>
          </Link>
        </nav>

        {/* Currency Status Hub */}
        <div className={styles.currencies}>
          {/* Centralized Game Coins */}
          <Link to="/redeem" className={styles.coinPill} title="Central Game Coins balance. Click to redeem rewards!">
            <img src="/assets/game-coin.png" alt="Game Coin" className={styles.coinIcon} />
            <div className={styles.coinInfo}>
              <span className={styles.coinVal}>{gameCoins}</span>
              <span className={styles.coinLabel}>Game Coins</span>
            </div>
            <Sparkles size={14} className={styles.sparkle} />
          </Link>

          {/* Tokens Balance with Fast Top-up / Test Controls */}
          <div className={styles.tokenPillWrapper}>
            <button
              className={styles.tokenPill}
              onClick={() => setShowTokenMenu(!showTokenMenu)}
              title="Your Entry Tokens. Click to manage or test."
            >
              <img src="/assets/token.png" alt="Token" className={styles.tokenIcon} />
              <div className={styles.tokenInfo}>
                <span className={styles.tokenVal}>{tokens}</span>
                <span className={styles.tokenLabel}>Tokens</span>
              </div>
              <Plus size={14} className={styles.plusIcon} />
            </button>

            {/* Quick Test / Refill Menu */}
            {showTokenMenu && (
              <div className={styles.tokenDropdown}>
                <div className={styles.dropdownHeader}>Token Controls</div>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    addTokens(40);
                    setShowTokenMenu(false);
                  }}
                >
                  <Plus size={14} /> Add +40 Tokens
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setTestTokens(12); // Under 20 tokens to test insufficient token state!
                    setShowTokenMenu(false);
                  }}
                >
                  <RotateCcw size={14} /> Set 12 Tokens (Test Insufficient)
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setTestTokens(100);
                    setShowTokenMenu(false);
                  }}
                >
                  <Sparkles size={14} /> Set 100 Tokens
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
