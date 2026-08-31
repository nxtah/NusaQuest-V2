'use client';

import React, {useEffect, useRef, useState} from 'react';
import gsap from 'gsap';

export type DiceState = {
  isRolling: boolean;
  currentNumber: number;
  rollingPlayerId?: string;
};

interface DiceProps {
  onRollStart?: (number: number) => void;
  onRollComplete: (number: number, isUserAction: boolean) => void;
  disabled?: boolean;
  diceState?: DiceState;
  isMyTurn?: boolean;
  currentPlayerId?: string;
  myPlayerId?: string;
  /** `gameState.lastTurnChangeAt` — dasar hitung mundur 10 detik buat lempar
      dadu. Cuma tampilan (readout), penegakan skip-nya di page.tsx. */
  turnStartedAt?: number | null;
}

const ROLL_TIMEOUT_SECONDS = 10;

const FACE_ROTATIONS: Record<number, {x: number; y: number}> = {
  1: {x: 0, y: 0},
  2: {x: 0, y: 180}, // Back
  3: {x: 0, y: -90}, // Right
  4: {x: 0, y: 90},  // Left
  5: {x: -90, y: 0}, // Top
  6: {x: 90, y: 0},  // Bottom
};

const DiceFace: React.FC<{number: number}> = ({number}) => {
  const pips: Array<[number, number][]> = [
    [], // 0 (unused)
    [[50, 50]], // 1: center
    [
      [30, 30],
      [70, 70],
    ], // 2: diagonal corners
    [
      [30, 30],
      [50, 50],
      [70, 70],
    ], // 3: diagonal line
    [
      [30, 30],
      [70, 30],
      [30, 70],
      [70, 70],
    ], // 4: four corners
    [
      [30, 30],
      [70, 30],
      [50, 50],
      [30, 70],
      [70, 70],
    ], // 5: four corners + center
    [
      [30, 30],
      [70, 30],
      [30, 50],
      [70, 50],
      [30, 70],
      [70, 70],
    ], // 6: two columns of 3
  ];

  return (
    <div
      className="absolute bg-white flex items-center justify-center rounded-md"
      style={{
        backfaceVisibility: 'hidden',
        width: 'calc(100% + 4px)',
        height: 'calc(100% + 4px)',
        margin: '-2px',
        border: '2px solid #141414',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 3px 6px rgba(0,0,0,0.2)',
      }}
    >
      <div className="relative w-full h-full">
        {pips[number]?.map((pip, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gray-900"
            style={{
              width: '18%',
              height: '18%',
              left: `${pip[0]}%`,
              top: `${pip[1]}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function Dice({
  onRollStart,
  onRollComplete,
  disabled = false,
  diceState,
  isMyTurn = false,
  currentPlayerId,
  myPlayerId,
  turnStartedAt,
}: DiceProps) {
  const [isLocalRolling, setIsLocalRolling] = useState(false);
  const [rollSecondsLeft, setRollSecondsLeft] = useState(ROLL_TIMEOUT_SECONDS);
  const isLocalRollingRef = useRef(false);
  const [currentFace, setCurrentFace] = useState(1);
  const diceRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const clickLockRef = useRef(false);

  const [DICE_SIZE, setDiceSize] = useState(44);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerHeight < 600 || window.innerWidth < 1024) {
        setDiceSize(28);
      } else {
        setDiceSize(44);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hitung mundur 10 detik buat lempar dadu — cuma jalan pas beneran lagi
  // nunggu giliran sendiri lempar (bukan pas dadu diputer/gak ada giliran).
  // Penegakan skip-nya sendiri ada di page.tsx, ini murni tampilan.
  useEffect(() => {
    if (!turnStartedAt || !isMyTurn || disabled || isLocalRolling) {
      setRollSecondsLeft(ROLL_TIMEOUT_SECONDS);
      return;
    }
    const tick = () => {
      const elapsed = (Date.now() - turnStartedAt) / 1000;
      setRollSecondsLeft(Math.max(0, Math.ceil(ROLL_TIMEOUT_SECONDS - elapsed)));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [turnStartedAt, isMyTurn, disabled, isLocalRolling]);

  // Ref untuk cegah onRollComplete dipanggil lebih dari sekali per roll
  const hasCalledRef = useRef(false);

  // Handle external dice state change (multiplayer sync)
  useEffect(() => {
    if (!diceState?.isRolling) {
      hasCalledRef.current = false;
      clickLockRef.current = false;
      if (isLocalRollingRef.current) {
        isLocalRollingRef.current = false;
        setIsLocalRolling(false);
      }
      return;
    }

    // Sudah animasi — skip
    if (isLocalRollingRef.current || hasCalledRef.current) return;

    // Roll dari pemain lain (atau bot) — jalankan animasi
    isLocalRollingRef.current = true;
    setIsLocalRolling(true);
    animateDice(diceState.currentNumber);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diceState?.isRolling, diceState?.currentNumber, diceState?.rollingPlayerId]);

  const animateDice = (finalNumber: number, isLocalRoll = false) => {
    if (!diceRef.current) return;

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    // Reset to known base state before animating
    gsap.set(diceRef.current, {
      rotationX: 0,
      rotationY: 0,
      transformOrigin: '50% 50%',
      transformStyle: 'preserve-3d',
    });

    // Calculate spin amounts (multiple full rotations + final offset)
    const spinX = 720 + Math.random() * 360;
    const spinY = 720 + Math.random() * 360;

    const finalRot = FACE_ROTATIONS[finalNumber] || FACE_ROTATIONS[1];
    const finalRotX = spinX + finalRot.x;
    const finalRotY = spinY + finalRot.y;

    // Animate with GSAP
    animationRef.current = gsap.to(diceRef.current, {
      rotationX: finalRotX,
      rotationY: finalRotY,
      duration: 1.0,
      ease: 'power2.out',
      onComplete: () => {
        // Snap to exact final rotation to prevent drift
        gsap.set(diceRef.current, {
          rotationX: finalRot.x,
          rotationY: finalRot.y,
        });
        setCurrentFace(finalNumber);
        animationRef.current = null;

        isLocalRollingRef.current = false;
        setIsLocalRolling(false);
        clickLockRef.current = false;

        if (isLocalRoll || hasCalledRef.current) {
          onRollComplete(finalNumber, true);
        }
      },
    });
  };

  const handleRollClick = () => {
    if (disabled) {
      return;
    } else if (clickLockRef.current) {
      return;
    } else if (isLocalRolling) {
      return;
    } else if (!isMyTurn) {
      return;
    }

    const randomNumber = Math.floor(Math.random() * 6) + 1;
    clickLockRef.current = true;
    hasCalledRef.current = true;
    isLocalRollingRef.current = true;
    setIsLocalRolling(true);

    // Beritahu parent (dan Firebase) bahwa roll sudah dimulai, agar pemain lain bisa melihat animasi
    if (onRollStart) onRollStart(randomNumber);

    animateDice(randomNumber, true);
    // onRollComplete HANYA akan dipanggil di dalam onComplete animasi GSAP di atas
  };

  const isOtherPlayerRolling =
    diceState?.isRolling && diceState.rollingPlayerId && diceState.rollingPlayerId !== myPlayerId;

  const isNotMyTurn = !isMyTurn;

  return (
    <div className="flex flex-col items-center gap-1 md:gap-4 w-full">
      <style>{`
        .nq-ut-dice-roll-btn {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          color: #4a2a1a;
          box-shadow:
            0 4px 0 #c6841a,
            0 6px 10px rgba(120, 72, 0, 0.35),
            inset -2px -2px 4px rgba(150, 90, 0, 0.25),
            inset 2px 2px 4px rgba(255, 255, 255, 0.65);
          transition: transform 140ms ease-out, box-shadow 140ms ease-out, filter 140ms ease-out;
        }
        .nq-ut-dice-roll-btn:not(:disabled):hover {
          filter: brightness(1.05);
          transform: translateY(-2px);
        }
        .nq-ut-dice-roll-btn:not(:disabled):active {
          transform: translateY(2px);
        }
        .nq-ut-dice-roll-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .nq-ut-dice-timer {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          color: #4a2a1a;
          box-shadow:
            0 2px 4px rgba(139, 94, 42, 0.3),
            inset -1px -1px 3px rgba(139, 94, 42, 0.18),
            inset 1px 1px 3px rgba(255, 255, 255, 0.85);
        }
        .nq-ut-dice-timer--urgent {
          background: linear-gradient(150deg, #fde6e6 0%, #f3b8b8 100%);
          color: #7a1f1f;
          animation: nq-ut-dice-timer-pulse 0.6s ease-in-out infinite;
        }
        @keyframes nq-ut-dice-timer-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nq-ut-dice-timer--urgent { animation: none; }
        }
      `}</style>
      {/* Dice Container - Smaller Compact Size */}
      <div
        style={{
          perspective: '1200px',
          width: DICE_SIZE,
          height: DICE_SIZE,
        }}
        className="flex shrink-0 items-center justify-center"
      >
        <div
          ref={diceRef}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: 'relative',
            transformOrigin: '50% 50% 0',
          }}
        >
          {/* Face 1 - Front */}
          <div
            style={{
              position: 'absolute',
              width: 'calc(100% + 4px)',
              height: 'calc(100% + 4px)',
              margin: '-2px',
              transformStyle: 'preserve-3d',
              transform: `translateZ(${DICE_SIZE / 2 + 2}px)`,
            }}
          >
            <DiceFace number={1} />
          </div>

          {/* Face 2 - Back */}
          <div
            style={{
              position: 'absolute',
              width: 'calc(100% + 4px)',
              height: 'calc(100% + 4px)',
              margin: '-2px',
              transformStyle: 'preserve-3d',
              transform: `rotateY(180deg) translateZ(${DICE_SIZE / 2 + 2}px)`,
            }}
          >
            <DiceFace number={2} />
          </div>

          {/* Face 3 - Right */}
          <div
            style={{
              position: 'absolute',
              width: 'calc(100% + 4px)',
              height: 'calc(100% + 4px)',
              margin: '-2px',
              transformStyle: 'preserve-3d',
              transform: `rotateY(90deg) translateZ(${DICE_SIZE / 2 + 2}px)`,
            }}
          >
            <DiceFace number={3} />
          </div>

          {/* Face 4 - Left */}
          <div
            style={{
              position: 'absolute',
              width: 'calc(100% + 4px)',
              height: 'calc(100% + 4px)',
              margin: '-2px',
              transformStyle: 'preserve-3d',
              transform: `rotateY(-90deg) translateZ(${DICE_SIZE / 2 + 2}px)`,
            }}
          >
            <DiceFace number={4} />
          </div>

          {/* Face 5 - Top */}
          <div
            style={{
              position: 'absolute',
              width: 'calc(100% + 4px)',
              height: 'calc(100% + 4px)',
              margin: '-2px',
              transformStyle: 'preserve-3d',
              transform: `rotateX(90deg) translateZ(${DICE_SIZE / 2 + 2}px)`,
            }}
          >
            <DiceFace number={5} />
          </div>

          {/* Face 6 - Bottom */}
          <div
            style={{
              position: 'absolute',
              width: 'calc(100% + 4px)',
              height: 'calc(100% + 4px)',
              margin: '-2px',
              transformStyle: 'preserve-3d',
              transform: `rotateX(-90deg) translateZ(${DICE_SIZE / 2 + 2}px)`,
            }}
          >
            <DiceFace number={6} />
          </div>
        </div>
      </div>

      {/* Status & Button - Only show when appropriate */}
      <div className="flex flex-col items-center gap-1 lg:gap-3 w-full">
        {/* Other player rolling status */}
        {isOtherPlayerRolling && (
          <p className="text-[10px] lg:text-sm font-semibold text-gray-700 text-center px-2">
            🎲 Sedang melempar dadu...
          </p>
        )}

        {/* Not my turn status - show when it's someone else's turn */}
        {isNotMyTurn && !isOtherPlayerRolling && (
          <p className="text-[10px] lg:text-sm font-semibold text-gray-600 text-center px-2">
            ⏳ Tunggu giliran pemain lain...
          </p>
        )}

        {/* Hitung mundur 10 detik buat lempar dadu — nongol pas beneran
            nunggu giliran sendiri lempar (bukan pas dadu diputer). Telat =
            giliran ke-skip otomatis (ditegakin di page.tsx). */}
        {isMyTurn && !isOtherPlayerRolling && !disabled && !isLocalRolling && turnStartedAt ? (
          <span
            className={`nq-ut-dice-timer flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center rounded-full text-[10px] lg:text-xs font-black ${
              rollSecondsLeft <= 3 ? 'nq-ut-dice-timer--urgent' : ''
            }`}
          >
            {rollSecondsLeft}
          </span>
        ) : null}

        {/* Roll button - Only show when it's my turn and no one is rolling */}
        {isMyTurn && !isOtherPlayerRolling && (
          <button
            onClick={handleRollClick}
            disabled={disabled || isLocalRolling || clickLockRef.current}
            className="nq-ut-dice-roll-btn px-3 py-1 lg:px-5 lg:py-2.5 font-bold text-[12px] lg:text-sm rounded-full whitespace-nowrap"
          >
            {isLocalRolling ? 'Rolling...' : 'Roll'}
          </button>
        )}
      </div>
    </div>
  );
}
