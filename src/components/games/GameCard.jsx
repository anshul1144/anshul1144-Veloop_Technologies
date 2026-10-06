import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import styles from "./GameCard.module.css";

export default function GameCard({ game }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/games/${game.id}`);
  };

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Play ${game.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Top Artwork Area - Image Only (Section 1, 2, 6) */}
      <div className={styles.imageContainer}>
        {/* Badges */}
        <div className={styles.badgeContainer}>
          {game.tag && (
            <span className={styles.tagBadge}>
              {game.tag}
            </span>
          )}
          {game.playable && (
            <span className={styles.playableBadge}>
              <Sparkles size={11} /> Playable
            </span>
          )}
        </div>

        <picture>
          <source srcSet={game.image} type="image/avif" />
          <source srcSet={game.image.replace('.avif', '.webp')} type="image/webp" />
          <img
            src={game.image}
            alt={game.name}
            loading="lazy"
            className={styles.artwork}
          />
        </picture>

        {/* Subtle glass sheen overlay */}
        <div className={styles.imageOverlay} />
      </div>

      {/* Bottom Coded Section (Section 2, 12, 13, 14, 27) */}
      <div className={styles.footer} onClick={(e) => e.stopPropagation()}>
        {/* Token Cost Requirement */}
        <div className={styles.costRow}>
          <div className={styles.tokenCost}>
            <img
              src="/assets/token.png"
              alt="Token"
              className={styles.tokenIcon}
            />
            <span className={styles.costText}>{game.cost} Tokens</span>
          </div>

          <span className={styles.gameCategory}>{game.category}</span>
        </div>

        {/* Play Now Button with Continuous Infinite Shimmer */}
        <button
          className={styles.playButton}
          onClick={handleCardClick}
          aria-label={`Play now for ${game.cost} tokens`}
        >
          <span className={styles.btnText}>Play Now</span>
          <ArrowRight size={17} className={styles.btnArrow} />
        </button>
      </div>
    </article>
  );
}
