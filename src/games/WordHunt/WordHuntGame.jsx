import React, { useState, useEffect } from "react";
import { ArrowLeft, Volume2, VolumeX, Sparkles } from "lucide-react";
import { arcadeAudio } from "../../utils/audio";
import GameOverModal from "../../components/shared/GameOverModal";
import styles from "./WordHunt.module.css";

export default function WordHuntGame({ game, onFinishGame, onBack }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [wordsFound, setWordsFound] = useState([]);
  const [tokensWon, setTokensWon] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [reviveCount, setReviveCount] = useState(0);

  const [selectedIndices, setSelectedIndices] = useState([]);

  // Letter grid containing solvable target words: COIN, GAME, VELOOP, STORM, BLADE, WIN, GOLD
  const letters = [
    "C", "O", "I", "N",
    "G", "A", "M", "E",
    "V", "E", "L", "O",
    "P", "W", "I", "N"
  ];

  const targetWords = ["COIN", "GAME", "VELOOP", "WIN", "IN", "NO", "ON", "MEN", "GO", "AIM"];

  // Countdown timer
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameOverReason("Time expired! Great word hunting!");
          setIsGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  const currentWord = selectedIndices.map((i) => letters[i]).join("");

  const handleTileClick = (index) => {
    if (isGameOver) return;
    if (selectedIndices.includes(index)) {
      // Deselect tile
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
      if (soundEnabled) arcadeAudio.playTap();
    }
  };

  const handleSubmit = () => {
    if (isGameOver || !currentWord) return;

    if (targetWords.includes(currentWord)) {
      if (wordsFound.includes(currentWord)) {
        if (soundEnabled) arcadeAudio.playDefeat();
      } else {
        const pts = currentWord.length * 60;
        setScore((s) => s + pts);
        setWordsFound([...wordsFound, currentWord]);
        if (soundEnabled) arcadeAudio.playScore();

        // Bonus tokens every 3 words
        if ((wordsFound.length + 1) % 3 === 0) {
          setTokensWon((t) => t + 5);
          if (soundEnabled) arcadeAudio.playWin();
        }
      }
    } else {
      if (soundEnabled) arcadeAudio.playDefeat();
    }
    setSelectedIndices([]);
  };

  const calculateEarnedCoins = (pts) => {
    if (pts >= 350) return 25;
    if (pts >= 180) return 15;
    return 8;
  };

  return (
    <div className={styles.gameContainer}>
      <header className={styles.hud}>
        <button className={styles.backBtn} onClick={onBack}>
          <ArrowLeft size={16} /> Exit
        </button>
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <span className={styles.statLabel}>TIME</span>
            <span className={styles.statValue}>{timeLeft}s</span>
          </div>
          <div className={styles.statPillHighlight}>
            <span className={styles.statLabel}>SCORE</span>
            <span className={styles.statValue}>{score}</span>
          </div>
          {tokensWon > 0 && (
            <div className={styles.statPill}>
              <Sparkles size={14} color="#3b82f6" />
              <span className={styles.statValue}>+{tokensWon} Tokens</span>
            </div>
          )}
          <button
            className={styles.soundBtn}
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              arcadeAudio.enabled = !soundEnabled;
            }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </header>

      <div className={styles.gameArea}>
        <div className={styles.wordDisplay}>
          {currentWord || "TAP LETTERS"}
        </div>

        <div className={styles.letterGrid}>
          {letters.map((char, idx) => (
            <button
              key={idx}
              className={`${styles.tile} ${selectedIndices.includes(idx) ? styles.tileSelected : ""}`}
              onClick={() => handleTileClick(idx)}
            >
              {char}
            </button>
          ))}
        </div>

        <div className={styles.actionsRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            SUBMIT WORD ({currentWord.length})
          </button>
          <button className={styles.clearBtn} onClick={() => setSelectedIndices([])}>
            CLEAR
          </button>
        </div>

        <div className={styles.targetsBox}>
          FOUND ({wordsFound.length}): {wordsFound.join(", ") || "None yet! Spell COIN, GAME, WIN, VELOOP..."}
        </div>
      </div>

      <GameOverModal
        isOpen={isGameOver}
        score={score}
        earnedCoins={calculateEarnedCoins(score)}
        earnedTokens={tokensWon}
        reason={gameOverReason}
        isMistake={false}
        canRevive={reviveCount < 1}
        reviveCount={reviveCount}
        maxRevives={1}
        onRevive={() => {
          setReviveCount(1);
          setTimeLeft(25);
          setIsGameOver(false);
        }}
        onNoThanks={() => onFinishGame(calculateEarnedCoins(score), score, tokensWon)}
        onPlayAgain={() => {
          setScore(0);
          setTimeLeft(40);
          setWordsFound([]);
          setSelectedIndices([]);
          setIsGameOver(false);
        }}
      />
    </div>
  );
}
