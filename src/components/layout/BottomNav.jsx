import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Gift, Gamepad2 } from "lucide-react";
import styles from "./BottomNav.module.css";

export default function BottomNav({ activeGameId }) {
  const location = useLocation();

  const isHomeActive = location.pathname === "/" || (activeGameId && location.pathname === `/games/${activeGameId}`);
  const isRedeemActive = location.pathname === "/redeem";

  return (
    <nav className={styles.bottomBar} aria-label="Game Ecosystem Navigation">
      <div className={styles.container}>
        {/* Home Button (Section 55.28) */}
        <Link
          to={activeGameId ? `/games/${activeGameId}` : "/"}
          className={`${styles.navItem} ${isHomeActive ? styles.active : ""}`}
        >
          <div className={styles.iconWrapper}>
            {activeGameId ? <Home size={20} /> : <Gamepad2 size={20} />}
          </div>
          <span className={styles.label}>{activeGameId ? "Game Home" : "All Games"}</span>
        </Link>

        <div className={styles.divider} />

        {/* Redeem Button (Section 55.29) */}
        <Link
          to="/redeem"
          className={`${styles.navItem} ${isRedeemActive ? styles.active : ""}`}
        >
          <div className={styles.iconWrapper}>
            <Gift size={20} />
          </div>
          <span className={styles.label}>Redeem Center</span>
        </Link>
      </div>
    </nav>
  );
}
