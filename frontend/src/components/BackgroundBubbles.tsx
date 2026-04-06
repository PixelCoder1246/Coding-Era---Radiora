'use client';

import React, { useMemo } from 'react';
import styles from './BackgroundBubbles.module.css';

/**
 * A cinematic "Soft Dot" background.
 * Particles scaled to 5-12px and distributed 10-90% for a balanced look.
 */
export default function BackgroundBubbles() {
  const bubbles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      // Spread from 10% to 90% top-to-bottom
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 100}%`,
      // Smaller "Soft Dots" (5px - 12px)
      size: `${Math.random() * 7 + 5}px`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 15 + 15}s`,
      opacity: Math.random() * 0.12 + 0.04,
    }));
  }, []);

  return (
    <div className={styles.container}>
      {/* Nebula Globs (Broad, soft glows) */}
      <div className={`${styles.nebula} ${styles.blueNebula}`} />
      <div className={`${styles.nebula} ${styles.purpleNebula}`} />
      <div className={`${styles.nebula} ${styles.centerGlow}`} />

      {/* Drifting Soft Dots */}
      {bubbles.map(b => (
        <div
          key={b.id}
          className={styles.bubble}
          style={
            {
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              opacity: b.opacity,
              animationDelay: b.delay,
              animationDuration: b.duration,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
