import React, { useRef, useState, useEffect } from "react";
import GameCard from "./GameCard";
import styles from "./GamesCarousel.module.css";

export default function GamesCarousel({ games }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll loop (Section 18 & 19)
  useEffect(() => {
    if (isPaused || isDragging) return;

    const interval = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;

      const cardWidth = container.querySelector(`.${styles.cardWrapper}`)?.offsetWidth || 326;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 10) {
        // Seamlessly return to start
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, isDragging]);

  // Update active dot index based on scroll position
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector(`.${styles.cardWrapper}`)?.offsetWidth || 326;
    const scrollPos = container.scrollLeft;
    const index = Math.round(scrollPos / cardWidth);
    setActiveIndex(Math.min(Math.max(index, 0), games.length - 1));
  };

  // Click dot to jump directly to card
  const scrollToCard = (index) => {
    const container = containerRef.current;
    if (!container) return;

    const cardWidth = container.querySelector(`.${styles.cardWrapper}`)?.offsetWidth || 326;
    container.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
    setActiveIndex(index);
  };

  // Mouse drag handlers for desktop trackpad/drag usability (Section 20)
  const handleMouseDown = (e) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <section
      className={styles.carouselSection}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsDragging(false);
      }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      aria-label="Games Carousel"
    >
      {/* Horizontally scrolling track - No left/right arrows as explicitly mandated */}
      <div
        ref={containerRef}
        className={`${styles.track} ${isDragging ? styles.grabbing : ""}`}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
      >
        {games.map((game, idx) => (
          <div key={game.id} className={styles.cardWrapper}>
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {/* Clean Interactive Carousel Indicators (Dots) */}
      <div className={styles.indicators} role="tablist" aria-label="Game slides">
        {games.map((game, idx) => (
          <button
            key={game.id}
            role="tab"
            aria-selected={activeIndex === idx}
            aria-label={`Go to ${game.name}`}
            className={`${styles.dot} ${activeIndex === idx ? styles.activeDot : ""}`}
            onClick={() => scrollToCard(idx)}
          />
        ))}
      </div>
    </section>
  );
}
