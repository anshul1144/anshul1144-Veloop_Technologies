import React, { useState } from "react";
import { Sparkles, Gamepad2, ShieldCheck, Flame, Trophy, Coins, Compass } from "lucide-react";
import GamesCarousel from "../components/games/GamesCarousel";
import GameCard from "../components/games/GameCard";
import BottomNav from "../components/layout/BottomNav";
import { games } from "../data/gamesData";
import { useGameCoins } from "../context/GameCoinContext";
import styles from "./GamesHub.module.css";

const CATEGORIES = ["All Games", "Action & Reflex", "Puzzle & Brain", "Arcade", "Strategy"];

export default function GamesHub() {
  const { gameCoins, tokens } = useGameCoins();
  const [activeCategory, setActiveCategory] = useState("All Games");
  const [viewMode, setViewMode] = useState("carousel"); // 'carousel' or 'grid'

  const filteredGames = games.filter((g) => {
    if (activeCategory === "All Games") return true;
    if (activeCategory === "Action & Reflex") return g.category.includes("Action") || g.category.includes("Reflex");
    if (activeCategory === "Puzzle & Brain") return g.category.includes("Puzzle") || g.category.includes("Brain");
    if (activeCategory === "Arcade") return g.category.includes("Arcade") || g.category.includes("Casual");
    if (activeCategory === "Strategy") return g.category.includes("Strategy") || g.category.includes("Tactics");
    return true;
  });

  return (
    <main className={styles.main}>
      {/* Hero Header (Section 51) */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.tagLine}>
            <Sparkles size={14} className={styles.sparkleIcon} />
            <span>VELOOP REWARDS ECOSYSTEM</span>
          </div>

          <h1 className={styles.heroTitle}>
            GAMES & REWARDS
          </h1>

          <p className={styles.heroSubtitle}>
            Explore 13 adrenaline-fueled mini-games, compete for high scores, and earn centralized VELOOP Game Coins redeemable for platform energy, gems, tokens, and spin vouchers!
          </p>

          {/* Quick Metrics Bar */}
          <div className={styles.statsBar}>
            <div className={styles.statBox}>
              <div className={styles.statIconWrapper}>
                <Coins size={20} className={styles.statIconGold} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statNum}>{gameCoins}</span>
                <span className={styles.statDesc}>Game Coins Balance</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconWrapper}>
                <img src="/assets/token.png" alt="Token" className={styles.tokenStatImg} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statNum}>{tokens}</span>
                <span className={styles.statDesc}>Available Tokens (20 / Play)</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconWrapper}>
                <Flame size={20} className={styles.statIconGreen} />
              </div>
              <div className={styles.statMeta}>
                <span className={styles.statNum}>2 Playable</span>
                <span className={styles.statDesc}>Blade Master & Slice Storm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills & View Switcher */}
      <section className={styles.filterSection}>
        <div className={styles.filterContainer}>
          <div className={styles.pillsList}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.pillBtn} ${activeCategory === cat ? styles.activePill : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${viewMode === "carousel" ? styles.activeToggle : ""}`}
              onClick={() => setViewMode("carousel")}
              aria-label="Carousel View"
            >
              Carousel (13 Cards)
            </button>
            <button
              className={`${styles.toggleBtn} ${viewMode === "grid" ? styles.activeToggle : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
            >
              Full Grid
            </button>
          </div>
        </div>
      </section>

      {/* Main 13 Game Banners Section (Section 17, 18, 51) */}
      <section className={styles.gamesSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <h2 className={styles.sectionTitle}>
              Featured Game Banners
            </h2>
            <span className={styles.sectionSubtitle}>
              Auto-scrolling • Swipe or drag • Continuous infinite Play Now shimmer
            </span>
          </div>

          <div className={styles.tokenReminder}>
            <img src="/assets/token.png" alt="Token" className={styles.reminderTokenIcon} />
            <span>All Games: <strong>20 Tokens</strong> Entry</span>
          </div>
        </div>

        {viewMode === "carousel" ? (
          /* Horizontally scrolling carousel with all 13 games, auto-scroll, dots, and NO arrows */
          <GamesCarousel games={filteredGames} />
        ) : (
          /* Full Grid Presentation */
          <div className={styles.gamesGrid}>
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Playable Games Spotlight */}
      <section className={styles.spotlightSection}>
        <div className={styles.spotlightCard}>
          <div className={styles.spotlightBadge}>
            <Trophy size={14} /> MANDATORY ADVANCED GAMES
          </div>
          <h3 className={styles.spotlightTitle}>Two Fully Playable Web Games Ready to Play!</h3>
          <p className={styles.spotlightDesc}>
            Dive straight into <strong>Blade Master!</strong> (precision knife throwing) or <strong>Slice Storm!</strong> (fruit slicing slash trails & combos). Both are integrated with 20 Token deduction, Game Guides, score multipliers, working Revives, and centralized Game Coin rewards!
          </p>
        </div>
      </section>

      {/* Global Bottom Navigation (Section 55.27) */}
      <BottomNav />
    </main>
  );
}
