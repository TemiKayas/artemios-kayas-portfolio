'use client';

import { useEffect, useState } from 'react';

export default function Stars() {
  const [stars, setStars] = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    const starCount = 100;
    const newStars = Array.from({ length: starCount }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="stars">
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
