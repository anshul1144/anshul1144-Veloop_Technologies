import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, BookOpen, Sparkles, Trophy, ShieldAlert, CheckCircle2 } from "lucide-react";
import { games } from "../data/gamesData";
import { useGameCoins } from "../context/GameCoinContext";
import BottomNav from "../components/layout/BottomNav";
import TokenModal from "../components/shared/TokenModal";
import GameGuideModal from "../components/shared/GameGuideModal";
import BladeMasterGame from "../games/BladeMaster/BladeMasterGame";
import SliceStormGame from "../games/SliceStorm/SliceStormGame";
import styles from "./GameHome.module.css";

export default function GameHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const gameId = parseInt(id, 10);
  const game = games.find((g) => g.id === gameId) || games[0];

  const {
    gameCoins,
    tokens,
    addCoins,
    deductTokens,
    hasSeenGuide,
    markGuideSeen
  } = useGameCoins();

  // Screen modes: 'home' | 'guide' | 'playing'
  const [screenMode, setScreenMode] = useState("home");
  const [showTokenError, setShowTokenError] = useState(false);
  const [recentReward, setRecentReward] = useState(null);

  // Play Now Click Handler (Section 55.13 & 55.14)
  const handlePlayNowClick = () => {
    // 1. Check if user has sufficient tokens
    if (tokens < game.cost) {
      setShowTokenError(true);
      return;
    }

    // 2. If game is not one of the 2 fully developed games, inform user
    if (!game.playable) {
      alert(
        `"${game.name}" is one of the 11 banner showcase games. Please play "Blade Master!" or "Slice Storm!" for the 2 fully playable game experiences mandated by the specification!`
      );
      return;
    }

    // 3. Deduct 20 tokens
    const success = deductTokens(game.cost);
    if (!success) {
      setShowTokenError(true);
      return;
    }

    // 4. First-time guide check (Section 55.15 & 55.16)
    if (!hasSeenGuide(game.id)) {
      setScreenMode("guide");
    } else {
      setScreenMode("playing");
    }
  };

  // Confirm guide and start gameplay
  const handleGuideConfirm = () => {
    markGuideSeen(game.id);
    setScreenMode("playing");
  };

  // Called when player finishes run and clicks "No Thanks" (Section 55.25)
  const handleFinishGame = (earnedCoins, finalScore) => {
    addCoins(earnedCoins); // Centralized state update (Section 55.21 & 55.26)
    setRecentReward({ coins: earnedCoins, score: finalScore });
    setScreenMode("home");
    // Clear recent reward banner after 5s
    setTimeout(() => setRecentReward(null), 5000);
  };

  // IF USER IS IN ACTIVE GAMEPLAY: RENDER FULL GAMEPLAY SCREEN
  if (screenMode === "playing") {
    if (game.id === 1) {
      return (
        <BladeMasterGame
          game={game}
          onFinishGame={handleFinishGame}
          onBack={() => setScreenMode("home")}
        />
      );
    }
    if (game.id === 5) {
      return (
        <SliceStormGame
          game={game}
          onFinishGame={handleFinishGame}
          onBack={() => setScreenMode("home")}
        />
      );
    }
  }

  return (
    <div
      className={styles.pageWrapper}
      style={{
        "--game-accent": game.theme?.accentColor || "#f59e0b",
        "--game-light-bg": game.theme?.lightBg || "#fff"
      }}
    >
      {/* Light Theme Environment Header (Section 55.6 & 55.10) */}
      <header className={styles.topBar}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Back to all games"
        >
          <ArrowLeft size={18} />
          <span>All Games</span>
        </button>

        {/* Centralized Game Coins Balance Display (Section 55.8) */}
        <Link to="/redeem" className={styles.coinBalanceBadge} title="Central Game Coins. Click to redeem!">
          <img src="/assets/game-coin.png" alt="Game Coin" className={styles.coinImg} />
          <div className={styles.coinDetails}>
            <span className={styles.coinCount}>{gameCoins}</span>
            <span className={styles.coinWord}>Game Coins</span>
          </div>
        </Link>
      </header>

      {/* Main Game Home Content Card */}
      <main className={styles.contentContainer}>
        {/* Celebration Banner if just finished a game */}
        {recentReward && (
          <div className={styles.recentRewardAlert}>
            <CheckCircle2 size={20} className={styles.rewardSuccessIcon} />
            <div>
              <strong>Run Complete!</strong> You scored {recentReward.score} and earned{" "}
              <strong>+{recentReward.coins} Game Coins</strong> added to your central balance!
            </div>
          </div>
        )}

        <div className={styles.gameCardHero}>
          {/* Game Illustration & Artwork */}
          <div className={styles.artworkContainer}>
            <picture>
              <source srcSet={game.image} type="image/avif" />
              <img
                src={game.image}
                alt={game.name}
                className={styles.heroArtwork}
              />
            </picture>
            <div className={styles.artworkOverlay} />

            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>{game.category}</span>
              {game.playable ? (
                <span className={styles.playableBadge}>
                  <Sparkles size={12} /> Playable Web Game
                </span>
              ) : (
                <span className={styles.showcaseBadge}>Showcase Banner</span>
              )}
            </div>
          </div>

          {/* Game Info & Description */}
          <div className={styles.gameDetails}>
            <h1 className={styles.title}>{game.name}</h1>
            <p className={styles.subtitle}>{game.subtitle}</p>
            <p className={styles.description}>{game.description}</p>

            {/* Entry Fee Box (Section 55.11 & 55.12) */}
            <div className={styles.entryBox}>
              <div className={styles.entryInfo}>
                <span className={styles.entryLabel}>ENTRY FEE</span>
                <div className={styles.entryCost}>
                  <img src="/assets/token.png" alt="Token" className={styles.tokenIcon} />
                  <span>{game.cost} Tokens</span>
                </div>
              </div>

              <div className={styles.userBalanceHint}>
                <span>Your Balance:</span>
                <strong className={tokens >= game.cost ? styles.sufficient : styles.insufficient}>
                  {tokens} Tokens
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.playNowBtn}
                onClick={handlePlayNowClick}
                disabled={!game.playable}
              >
                <div className={styles.playBtnInner}>
                  <Play size={20} fill="#ffffff" />
                  <span>PLAY NOW</span>
                </div>
                <span className={styles.playBtnSub}>20 Tokens Per Play</span>
              </button>

              {game.guide && (
                <button
                  className={styles.guideBtn}
                  onClick={() => setScreenMode("guide")}
                >
                  <BookOpen size={18} />
                  <span>How to Play</span>
                </button>
              )}
            </div>

            {/* Non-playable notification banner */}
            {!game.playable && (
              <div className={styles.bannerNotice}>
                <ShieldAlert size={16} />
                <span>
                  This is one of the 11 banner showcase cards. Check out <strong>Blade Master!</strong> or <strong>Slice Storm!</strong> for the two fully developed web games!
                </span>
              </div>
            )}

            {/* Reward Potential Breakdown (Section 55.10 & 55.20) */}
            {game.rewards && (
              <div className={styles.rewardsTable}>
                <div className={styles.tableHeader}>
                  <Trophy size={16} className={styles.trophyIcon} />
                  <span>Game Coin Payout Structure</span>
                </div>
                <div className={styles.tableGrid}>
                  {game.rewards.map((r, i) => (
                    <div key={i} className={styles.tableRow}>
                      <span className={styles.scoreTarget}>{r.score}</span>
                      <span className={styles.rewardAmt}>+{r.coins} Game Coins</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Guide Modal */}
      <GameGuideModal
        game={game}
        isOpen={screenMode === "guide"}
        onConfirm={handleGuideConfirm}
      />

      {/* Insufficient Token Modal */}
      <TokenModal
        isOpen={showTokenError}
        onClose={() => setShowTokenError(false)}
        requiredTokens={game.cost}
      />

      {/* Bottom Navigation (Section 55.27) */}
      <BottomNav activeGameId={game.id} />
    </div>
  );
}
