'use client';

import { motion, useAnimation } from 'framer-motion';
import santaIcon from 'public/santaicon.png';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const BOARD_WIDTH = Math.min(
  400,
  typeof window !== 'undefined' ? window.innerWidth - 32 : 400,
);
const BOARD_HEIGHT = Math.min(
  600,
  typeof window !== 'undefined' ? window.innerHeight - 200 : 600,
);
const PEG_RADIUS = 8;
const SANTA_RADIUS = 22;
const BUCKET_WIDTH = BOARD_WIDTH / 5;
const BUCKET_HEIGHT = 50;
const ELASTICITY = 0.65;
const GRAVITY = 0.25;
const AIR_RESISTANCE = 0.02;
const TERMINAL_VELOCITY = 8;
const SOUND_THROTTLE = 80;

type Position = { x: number; y: number };

// Add type for score popup
type ScorePopup = {
  id: number;
  x: number;
  y: number;
};

// Add color constants for theme support
const THEME_COLORS = {
  light: {
    background: 'rgba(241, 245, 249, 0.9)', // Light blue-gray
    peg: '#FFD700', // Gold
    pegStroke: '#FFA500', // Orange
    pegOpacity: 0.8,
    bucket: {
      fill: 'rgba(203, 213, 225, 0.6)', // Light slate
      stroke: '#FFD700', // Gold
      winnerFill: 'rgba(234, 179, 8, 0.4)', // Amber
      winnerStroke: '#FFE873', // Light gold
    },
    text: {
      score: 'text-amber-600 dark:text-yellow-300',
      pegHits: 'text-amber-500/90 dark:text-yellow-200/80',
      instructions: 'text-slate-600/90 dark:text-white/70',
    },
    popup: '#FFB700', // Darker gold
  },
  dark: {
    background: 'rgba(13, 40, 71, 0.8)', // Deep blue
    peg: '#FFE873', // Light gold
    pegStroke: '#FFD700', // Gold
    pegOpacity: 0.7,
    bucket: {
      fill: 'rgba(16, 24, 39, 0.6)', // Dark gray
      stroke: '#FFD700', // Gold
      winnerFill: 'rgba(234, 179, 8, 0.3)', // Amber
      winnerStroke: '#FFE873', // Light gold
    },
    text: {
      score: 'text-yellow-300 dark:text-amber-300',
      pegHits: 'text-yellow-200/80 dark:text-amber-200/80',
      instructions: 'text-white/70 dark:text-slate-200/70',
    },
    popup: '#FFE873', // Light gold
  },
};

const Santa: React.FC<{ position: Position; rotation: number }> = ({
  position,
  rotation,
}) => {
  return (
    <g transform={`rotate(${rotation} ${position.x} ${position.y})`}>
      <image
        href={santaIcon.src}
        width={SANTA_RADIUS * 2}
        height={SANTA_RADIUS * 2}
        x={position.x - SANTA_RADIUS}
        y={position.y - SANTA_RADIUS}
      />
    </g>
  );
};

const Peg: React.FC<{ position: Position; isHit?: boolean }> = ({
  position,
  isHit,
}) => (
  <circle
    cx={position.x}
    cy={position.y}
    r={PEG_RADIUS}
    className={`
      fill-blue-300/90 dark:fill-slate-300/40 
      stroke-blue-400 dark:stroke-slate-200/60
      transition-opacity duration-150
      ${isHit ? 'animate-wiggle opacity-100' : 'opacity-80'}
    `}
    strokeWidth="1"
  />
);

const Bucket: React.FC<{
  position: Position;
  points: number;
  isWinner?: boolean;
}> = ({ position, points, isWinner }) => {
  const pointToEmoji = {
    1: '🪙',
    2: '🎁',
    5: '🌟',
    10: '🦌',
    25: '🎅',
  };

  // Randomly assign point values (but keep them consistent)
  const pointValues = [1, 2, 5, 10, 25];
  const actualPoints = pointValues[points - 1] || points;

  return (
    <g>
      <path
        d={`
          M ${position.x} ${position.y - 10}
          L ${position.x} ${position.y + BUCKET_HEIGHT}
          L ${position.x + BUCKET_WIDTH} ${position.y + BUCKET_HEIGHT}
          L ${position.x + BUCKET_WIDTH} ${position.y - 10}
        `}
        className={`
          ${
            isWinner
              ? 'fill-amber-200/40 dark:fill-amber-500/20 stroke-amber-400 dark:stroke-amber-400/60'
              : 'fill-blue-200/40 dark:fill-slate-500/20 stroke-blue-400 dark:stroke-slate-400/40'
          }
          transition-colors duration-300
        `}
        strokeWidth={isWinner ? 2 : 1}
      />
      <text
        x={position.x + BUCKET_WIDTH / 2}
        y={position.y + BUCKET_HEIGHT * 0.35}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="24"
        className={`
          transition-transform duration-300
          ${isWinner ? 'animate-ping-once scale-110' : 'scale-100'}
        `}
      >
        {pointToEmoji[actualPoints as keyof typeof pointToEmoji]}
      </text>
      <text
        x={position.x + BUCKET_WIDTH / 2}
        y={position.y + BUCKET_HEIGHT * 0.8}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-sm font-bold"
        fill={isWinner ? '#F59E0B' : 'currentColor'}
        style={{
          color: 'var(--bucket-text-color)',
        }}
      >
        {actualPoints} pts
      </text>
    </g>
  );
};

// Add helper function for line segment collision
const lineCircleCollision = (
  lineStart: Position,
  lineEnd: Position,
  circle: Position,
  radius: number,
) => {
  const ac = { x: circle.x - lineStart.x, y: circle.y - lineStart.y };
  const ab = { x: lineEnd.x - lineStart.x, y: lineEnd.y - lineStart.y };

  const ab2 = ab.x * ab.x + ab.y * ab.y;
  const acab = ac.x * ab.x + ac.y * ab.y;
  let t = acab / ab2;

  t = Math.max(0, Math.min(1, t));

  const closest = {
    x: lineStart.x + ab.x * t,
    y: lineStart.y + ab.y * t,
  };

  const distance = Math.sqrt(
    (circle.x - closest.x) ** 2 + (circle.y - closest.y) ** 2,
  );

  return {
    collision: distance <= radius,
    point: closest,
    normal:
      distance > 0
        ? {
            x: (circle.x - closest.x) / distance,
            y: (circle.y - closest.y) / distance,
          }
        : { x: 0, y: -1 },
  };
};

const ChristmasPlinko: React.FC = () => {
  const [santaPosition, setSantaPosition] = useState<Position>({
    x: BOARD_WIDTH / 2,
    y: SANTA_RADIUS + 5,
  });
  const [rotation, setRotation] = useState(0);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const velocity = useRef({ x: 0, y: 0, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const landingSoundRef = useRef<HTMLAudioElement | null>(null);
  const pegSoundRef = useRef<HTMLAudioElement | null>(null);
  const introSoundRef = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const pegSoundTemplate = useRef<string>('');
  const lastSoundTime = useRef(0);
  const [winningBucketIndex, setWinningBucketIndex] = useState<number | null>(
    null,
  );
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [pegScore, setPegScore] = useState(0);
  const popupIdRef = useRef(0);
  const [hitPeg, setHitPeg] = useState<number | null>(null);

  const pegs: Position[] = [];
  for (let row = 1; row <= 7; row++) {
    const basePegCount = 5;
    const spacing = BOARD_WIDTH / (basePegCount + 1);
    const isEvenRow = row % 2 === 0;
    const pegCount = isEvenRow ? basePegCount - 1 : basePegCount;
    const rowOffset = isEvenRow ? spacing / 2 : 0;

    for (let col = 0; col < pegCount; col++) {
      pegs.push({
        x: spacing + rowOffset + spacing * col,
        y: (BOARD_HEIGHT / 9) * row + BOARD_HEIGHT / 24,
      });
    }
  }

  const buckets = [1, 2, 5, 2, 1].map((points, index) => ({
    position: {
      x: index * BUCKET_WIDTH,
      y: BOARD_HEIGHT - BUCKET_HEIGHT,
    },
    points,
  }));

  const moveSanta = useCallback(() => {
    if (!gameActive) return;

    setSantaPosition((prev) => {
      velocity.current.y += GRAVITY;
      velocity.current.x = Math.max(Math.min(velocity.current.x, 6), -6);

      const speed = Math.sqrt(
        velocity.current.x ** 2 + velocity.current.y ** 2,
      );
      if (speed > 0) {
        const dragX = (velocity.current.x / speed) * speed * AIR_RESISTANCE;
        const dragY = (velocity.current.y / speed) * speed * AIR_RESISTANCE;
        velocity.current.x -= dragX;
        velocity.current.y -= dragY;
      }
      if (velocity.current.y > TERMINAL_VELOCITY) {
        velocity.current.y =
          TERMINAL_VELOCITY + (velocity.current.y - TERMINAL_VELOCITY) * 0.5;
      }
      velocity.current.x *= 0.99;

      velocity.current.rotation += velocity.current.x * 0.005;
      velocity.current.rotation *= 0.99;

      let newX = prev.x + velocity.current.x;
      let newY = prev.y + velocity.current.y;

      // Edge collisions
      if (newX < SANTA_RADIUS) {
        newX = SANTA_RADIUS;
        velocity.current.x = Math.abs(velocity.current.x) * ELASTICITY;
      }
      if (newX > BOARD_WIDTH - SANTA_RADIUS) {
        newX = BOARD_WIDTH - SANTA_RADIUS;
        velocity.current.x = -Math.abs(velocity.current.x) * ELASTICITY;
      }

      // Update bucket wall collisions
      if (newY > BOARD_HEIGHT - BUCKET_HEIGHT * 1.5) {
        for (const bucket of buckets) {
          // Left wall collision point - align with visual top
          const dx1 = newX - bucket.position.x;
          const dy1 = newY - (bucket.position.y - 10); // Adjust to match visual top
          const distance1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

          // Right wall collision point - align with visual top
          const dx2 = newX - (bucket.position.x + BUCKET_WIDTH);
          const dy2 = newY - (bucket.position.y - 10); // Adjust to match visual top
          const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          const minDistance = SANTA_RADIUS + PEG_RADIUS;

          // Handle left wall collision
          if (distance1 < minDistance) {
            const nx = dx1 / distance1;
            const ny = dy1 / distance1;
            const pushOutFactor = 1.1;

            newX = bucket.position.x + nx * minDistance * pushOutFactor;
            newY =
              bucket.position.y -
              10 + // Align with visual top
              ny * minDistance * pushOutFactor;

            const dotProduct =
              velocity.current.x * nx + velocity.current.y * ny;
            const randomFactor = (Math.random() - 0.5) * 0.3;

            velocity.current.x =
              (velocity.current.x - 2 * dotProduct * nx) * ELASTICITY +
              randomFactor;
            velocity.current.y =
              (velocity.current.y - 2 * dotProduct * ny) * ELASTICITY;
            playPegSound();
          }

          // Handle right wall collision
          if (distance2 < minDistance) {
            const nx = dx2 / distance2;
            const ny = dy2 / distance2;
            const pushOutFactor = 1.1;

            newX =
              bucket.position.x +
              BUCKET_WIDTH +
              nx * minDistance * pushOutFactor;
            newY =
              bucket.position.y -
              10 + // Align with visual top
              ny * minDistance * pushOutFactor;

            const dotProduct =
              velocity.current.x * nx + velocity.current.y * ny;
            const randomFactor = (Math.random() - 0.5) * 0.3;

            velocity.current.x =
              (velocity.current.x - 2 * dotProduct * nx) * ELASTICITY +
              randomFactor;
            velocity.current.y =
              (velocity.current.y - 2 * dotProduct * ny) * ELASTICITY;
            playPegSound();
          }
        }
      }

      const iterations = 3;
      for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < pegs.length; i++) {
          const peg = pegs[i];
          if (!peg) continue;
          const dx = newX - peg.x;
          const dy = newY - peg.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = SANTA_RADIUS + PEG_RADIUS;

          if (distance < minDistance) {
            const nx = dx / distance;
            const ny = dy / distance;
            const pushOutFactor = 1.1;
            newX = peg.x + nx * minDistance * pushOutFactor;
            newY = peg.y + ny * minDistance * pushOutFactor;

            const impactVelocity = Math.sqrt(
              velocity.current.x ** 2 + velocity.current.y ** 2,
            );

            const randomFactor =
              (Math.random() - 0.5) * Math.min(impactVelocity * 0.08, 0.4);

            const dotProduct =
              velocity.current.x * nx + velocity.current.y * ny;

            const tangentialVelocity = {
              x: velocity.current.x - dotProduct * nx,
              y: velocity.current.y - dotProduct * ny,
            };

            velocity.current.x =
              (velocity.current.x - 2 * dotProduct * nx) * ELASTICITY +
              tangentialVelocity.x * 0.5 +
              randomFactor;
            velocity.current.y =
              (velocity.current.y - 2 * dotProduct * ny) * ELASTICITY +
              tangentialVelocity.y * 0.5;

            if (velocity.current.y < -2) {
              velocity.current.y *= 0.7;
            }

            // Add score popup
            const popupId = popupIdRef.current++;
            setScorePopups((prev) => [
              ...prev,
              { id: popupId, x: newX, y: newY },
            ]);
            setPegScore((prev) => prev + 1);

            // Remove popup after animation
            setTimeout(() => {
              setScorePopups((prev) =>
                prev.filter((popup) => popup.id !== popupId),
              );
            }, 1000);

            // Set hit peg with correct index
            setHitPeg(i);
            setTimeout(() => {
              setHitPeg(null);
            }, 100); // Short duration for ping effect

            playPegSound();
          }
        }
      }

      if (newY > BOARD_HEIGHT - SANTA_RADIUS) {
        // Hit bottom of screen
        setGameActive(false);
        newY = BOARD_HEIGHT - SANTA_RADIUS;
        velocity.current = { x: 0, y: 0, rotation: 0 };

        // Check which bucket Santa landed in
        const bucketIndex = Math.min(
          Math.floor(newX / BUCKET_WIDTH),
          buckets.length - 1,
        );

        // Only count score if Santa landed in bucket area
        const bucketY = BOARD_HEIGHT - BUCKET_HEIGHT;
        if (newY >= bucketY) {
          setWinningBucketIndex(bucketIndex);
          setScore((prevScore) => prevScore + buckets[bucketIndex]!.points);
          playLandingSound();
        }
      }

      setRotation((prev) => prev + velocity.current.rotation);

      return { x: newX, y: newY };
    });
  }, [gameActive, pegs, buckets]);

  useEffect(() => {
    const gameLoop = setInterval(moveSanta, 16); // 60 FPS
    return () => clearInterval(gameLoop);
  }, [moveSanta]);

  useEffect(() => {
    if (!gameActive) {
      const handleKeyDown = (e: KeyboardEvent) => {
        const moveSpeed = 5;
        if (e.key === 'ArrowLeft') {
          setSantaPosition((prev) => ({
            ...prev,
            x: Math.max(SANTA_RADIUS, prev.x - moveSpeed),
          }));
        } else if (e.key === 'ArrowRight') {
          setSantaPosition((prev) => ({
            ...prev,
            x: Math.min(BOARD_WIDTH - SANTA_RADIUS, prev.x + moveSpeed),
          }));
        } else if (e.key === 'Space' || e.key === 'Enter') {
          startGame();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameActive]);

  useEffect(() => {
    landingSoundRef.current = new Audio('/ending.mp3');
    pegSoundTemplate.current = '/bumper.mp3';
    introSoundRef.current = new Audio('/wii-sports-intro.mp3');

    if (introSoundRef.current) introSoundRef.current.volume = 0.5;

    const enableSound = () => {
      setSoundEnabled(true);
      introSoundRef.current?.play().catch(console.error);
      document.removeEventListener('click', enableSound);
    };
    document.addEventListener('click', enableSound);

    return () => {
      document.removeEventListener('click', enableSound);
      landingSoundRef.current?.pause?.();
      pegSoundRef.current?.pause?.();
      introSoundRef.current?.pause?.();
    };
  }, []);

  const startGame = () => {
    setSantaPosition((prev) => ({
      x: prev.x,
      y: SANTA_RADIUS,
    }));
    setRotation(0);
    velocity.current = { x: 0, y: 0, rotation: 0 };
    setWinningBucketIndex(null);
    setGameActive(true);
  };

  const handleMouseDown = () => {
    if (!gameActive) setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      const svgRect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      setSantaPosition((prev) => ({
        ...prev,
        x: Math.max(SANTA_RADIUS, Math.min(BOARD_WIDTH - SANTA_RADIUS, x)),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const playPegSound = () => {
    const now = Date.now();
    if (
      soundEnabled &&
      pegSoundTemplate.current &&
      now - lastSoundTime.current > SOUND_THROTTLE
    ) {
      lastSoundTime.current = now;
      const sound = new Audio(pegSoundTemplate.current);
      sound.volume = 0.3;
      sound
        .play()
        .catch(console.error)
        .finally(() => {
          sound.remove();
        });
    }
  };

  const playLandingSound = () => {
    if (soundEnabled && landingSoundRef.current) {
      landingSoundRef.current.currentTime = 0;
      landingSoundRef.current?.play?.().catch(console.error);
    }
  };

  const handleBoardClick = () => {
    if (!gameActive && winningBucketIndex !== null) {
      setWinningBucketIndex(null);
      setSantaPosition((prev) => ({
        x: prev.x,
        y: SANTA_RADIUS,
      }));
    }
  };

  // Add ScorePopup component
  const ScorePopup: React.FC<{ x: number; y: number }> = ({ x, y }) => (
    <g className="score-popup">
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill="#FFE873"
        fontSize="16"
        className="animate-score-popup"
        style={{
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
        }}
      >
        +1
      </text>
    </g>
  );

  // Update button text based on game state
  const buttonText = () => {
    if (gameActive) return 'Dropping...';
    if (winningBucketIndex !== null) return 'Reset 🔄';
    return 'Drop Santa 🎅';
  };

  // Update button click handler
  const handleButtonClick = () => {
    if (winningBucketIndex !== null) {
      // Reset game
      setWinningBucketIndex(null);
      setSantaPosition((prev) => ({
        x: prev.x,
        y: SANTA_RADIUS,
      }));
    } else {
      // Start game
      startGame();
    }
  };

  return (
    <div className="p-2 sm:p-4 rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="mb-2 sm:mb-4 text-2xl sm:text-3xl font-bold text-blue-600 dark:text-slate-200">
        Score: {score}
      </div>
      <div className="mb-1 sm:mb-2 text-xs sm:text-sm text-blue-500 dark:text-slate-400/90">
        Peg Hits: {pegScore}
      </div>
      <div className="mb-1 sm:mb-2 text-xs sm:text-sm text-blue-600 dark:text-slate-400 font-medium">
        Position Santa and click Drop to start! 🎅
      </div>
      <svg
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="rounded-lg cursor-pointer bg-gradient-to-b from-blue-50/90 to-blue-100/90 dark:from-slate-800/90 dark:to-slate-900/90"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          if (!e.touches[0]) return;
          const touch = e.touches[0];
          const rect = e.currentTarget.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          if (!gameActive) {
            setIsDragging(true);
            setSantaPosition((prev) => ({
              ...prev,
              x: Math.max(
                SANTA_RADIUS,
                Math.min(BOARD_WIDTH - SANTA_RADIUS, x),
              ),
            }));
          }
        }}
        onTouchMove={(e) => {
          if (isDragging) {
            const touch = e.touches[0];
            if (!touch) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            setSantaPosition((prev) => ({
              ...prev,
              x: Math.max(
                SANTA_RADIUS,
                Math.min(BOARD_WIDTH - SANTA_RADIUS, x),
              ),
            }));
          }
        }}
        onTouchEnd={() => setIsDragging(false)}
        onClick={handleBoardClick}
      >
        {pegs.map((peg, index) => (
          <Peg key={index} position={peg} isHit={index === hitPeg} />
        ))}
        {buckets.map((bucket, index) => (
          <Bucket
            key={index}
            position={bucket.position}
            points={bucket.points}
            isWinner={index === winningBucketIndex}
          />
        ))}
        <Santa position={santaPosition} rotation={rotation} />
        {scorePopups.map((popup) => (
          <ScorePopup key={popup.id} x={popup.x} y={popup.y} />
        ))}
      </svg>
      <button
        className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto 
          bg-gradient-to-br from-red-500/90 to-red-600/90 
          text-white rounded-lg font-medium shadow-sm 
          transition-all duration-150 ease-in-out
          hover:shadow-md hover:from-red-600/90 hover:to-red-700/90 
          disabled:opacity-50 disabled:cursor-not-allowed
          text-sm sm:text-base"
        onClick={handleButtonClick}
        disabled={gameActive}
      >
        {buttonText()}
      </button>
    </div>
  );
};

export default ChristmasPlinko;
