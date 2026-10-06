import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, BookOpen, Sparkles, Trophy, CheckCircle2 } from "lucide-react";
import { games } from "../data/gamesData";
import { useGameCoins } from "../context/GameCoinContext";
import BottomNav from "../components/layout/BottomNav";
import TokenModal from "../components/shared/TokenModal";
import GameGuideModal from "../components/shared/GameGuideModal";

// Import all 13 arcade playable games
import BladeMasterGame from "../games/BladeMaster/BladeMasterGame";
import NutcraftGame from "../games/Nutcraft/NutcraftGame";
import BowlexaGame from "../games/Bowlexa/BowlexaGame";
import BlockCrushGame from "../games/BlockCrush/BlockCrushGame";
import SliceStormGame from "../games/SliceStorm/SliceStormGame";
import CosmoWarriorGame from "../games/CosmoWarrior/CosmoWarriorGame";
import ToiletTacticsGame from "../games/ToiletTactics/ToiletTacticsGame";
import WordHuntGame from "../games/WordHunt/WordHuntGame";
import BubbleBlastGame from "../games/BubbleBlast/BubbleBlastGame";
import MergeMasterGame from "../games/MergeMaster/MergeMasterGame";
import WormzyGame from "../games/Wormzy/WormzyGame";
import AquaFillGame from "../games/AquaFill/AquaFillGame";
import RealmClashGame from "../games/RealmClash/RealmClashGame";

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

  // Play Now Click Handler
  const handlePlayNowClick = () => {
    // 1. Check if user has sufficient tokens
    if (tokens < game.cost) {
      setShowTokenError(true);
      return;
    }

    // 2. Deduct 20 tokens
    const success = deductTokens(game.cost);
    if (!success) {
      setShowTokenError(true);
      return;
    }

    // 3. First-time guide check
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

  // Called when player finishes run and returns
  const handleFinishGame = (earnedCoins, finalScore, earnedTokens = 0) => {
    addCoins(earnedCoins);
    setRecentReward({ coins: earnedCoins, score: finalScore, tokens: earnedTokens });
    setScreenMode("home");
    // Clear recent reward banner after 6s
    setTimeout(() => setRecentReward(null), 6000);
  };

  // IF USER IS IN ACTIVE GAMEPLAY: RENDER FULL GAMEPLAY SCREEN
  if (screenMode === "playing") {
    switch (game.id) {
      case 1:
        return <BladeMasterGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 2:
        return <NutcraftGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 3:
        return <BowlexaGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 4:
        return <BlockCrushGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 5:
        return <SliceStormGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 6:
        return <CosmoWarriorGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 7:
        return <ToiletTacticsGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 8:
        return <WordHuntGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 9:
        return <BubbleBlastGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 10:
        return <MergeMasterGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 11:
        return <WormzyGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 12:
        return <AquaFillGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      case 13:
        return <RealmClashGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
      default:
        return <BladeMasterGame game={game} onFinishGame={handleFinishGame} onBack={() => setScreenMode("home")} />;
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
      {/* Header */}
      <header className={styles.topBar}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/")}
          aria-label="Back to Games"
        >
          <ArrowLeft size={16} />
          <span>All Games</span>
        </button>

        {/* Real-time Centralized Coin Balance */}
        <Link to="/redeem" className={styles.coinBalanceBadge}>
          <img src="/assets/game-coin.png" alt="Coins" className={styles.coinImg} />
          <div className={styles.coinDetails}>
            <span className={styles.coinCount}>{gameCoins.toLocaleString()}</span>
            <span className={styles.coinWord}>Game Coins</span>
          </div>
        </Link>
      </header>

      {/* Main Content Card Container */}
      <main className={styles.contentContainer}>
        {/* Recent Reward Floating Notification Banner */}
        {recentReward && (
          <div className={styles.recentRewardAlert} role="status">
            <CheckCircle2 size={20} className={styles.rewardSuccessIcon} />
            <div>
              <strong>Run Complete!</strong> You scored {recentReward.score} pts and received{" "}
              <strong>+{recentReward.coins} Game Coins</strong>
              {recentReward.tokens > 0 && ` and +${recentReward.tokens} Arcade Tokens`}!
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className={styles.gameCardHero}>
          {/* Left Hero Artwork Column */}
          <div className={styles.artworkContainer}>
            <img
              src={game.image}
              alt={game.name}
              className={styles.heroArtwork}
              loading="eager"
            />
            <div className={styles.artworkOverlay} />
            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>{game.category}</span>
              <span className={styles.playableBadge}>
                <Sparkles size={12} /> Playable Web Game
              </span>
            </div>
          </div>

          {/* Right Details Column */}
          <div className={styles.gameDetails}>
            <h1 className={styles.title}>{game.name}</h1>
            <p className={styles.subtitle}>{game.subtitle}</p>
            <p className={styles.description}>{game.description}</p>

            {/* Entry Cost Pill Box */}
            <div className={styles.entryBox}>
              <div className={styles.entryInfo}>
                <span className={styles.entryLabel}>ENTRY PER PLAY</span>
                <div className={styles.entryCost}>
                  <img src="/assets/token.png" alt="Token" className={styles.tokenIcon} />
                  <span>{game.cost} Arcade Tokens</span>
                </div>
              </div>

              <div className={styles.userBalanceHint}>
                <span>Your Tokens:</span>
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

            {/* Reward Potential Breakdown */}
            {game.rewards && (
              <div className={styles.rewardsTable}>
                <div className={styles.tableHeader}>
                  <Trophy size={16} className={styles.trophyIcon} />
                  <span>Reward Potential</span>
                </div>
                <div className={styles.tableGrid}>
                  {game.rewards.map((rew, index) => (
                    <div key={index} className={styles.tableRow}>
                      <span className={styles.scoreTarget}>{rew.score}</span>
                      <span className={styles.rewardAmt}>+{rew.coins} Coins</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Insufficient Token Modal */}
      <TokenModal
        isOpen={showTokenError}
        onClose={() => setShowTokenError(false)}
        requiredTokens={game.cost}
        currentTokens={tokens}
      />

      {/* First-time / Manual How to Play Guide Modal */}
      {game.guide && (
        <GameGuideModal
          isOpen={screenMode === "guide"}
          onClose={() => setScreenMode("home")}
          onConfirm={handleGuideConfirm}
          game={game}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav activeGameId={game.id} />
    </div>
  );
}
