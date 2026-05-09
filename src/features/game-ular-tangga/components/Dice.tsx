'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export type DiceState = {
  isRolling: boolean;
  currentNumber: number;
  rollingPlayerId?: string;
};

interface DiceProps {
  onRollComplete: (number: number, isUserAction: boolean) => void;
  disabled?: boolean;
  diceState?: DiceState;
  isMyTurn?: boolean;
  currentPlayerId?: string;
  myPlayerId?: string;
}

const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 180, y: 0 },
};

const DiceFace: React.FC<{ number: number }> = ({ number }) => {
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
  onRollComplete,
  disabled = false,
  diceState,
  isMyTurn = false,
  currentPlayerId,
  myPlayerId,
}: DiceProps) {
  const [isLocalRolling, setIsLocalRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(1);
  const diceRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

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

  // Handle external dice state change (multiplayer sync)
  useEffect(() => {
    if (diceState?.isRolling && !isLocalRolling) {
      animateDice(diceState.currentNumber);
      setIsLocalRolling(true);
    } else if (!diceState?.isRolling && isLocalRolling) {
      setIsLocalRolling(false);

      // Callback only if it's my turn (parent handles question display)
      if (isMyTurn) {
        onRollComplete(diceState?.currentNumber || 1, false);
      }
    }
  }, [diceState?.isRolling, isMyTurn, onRollComplete]);

  const animateDice = (finalNumber: number) => {
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
      },
    });
  };

  const handleRollClick = () => {
    if (disabled || isLocalRolling || !isMyTurn) return;

    const randomNumber = Math.floor(Math.random() * 6) + 1;
    setIsLocalRolling(true);
    animateDice(randomNumber);

    // Call parent handler
    onRollComplete(randomNumber, true);
  };

  const isOtherPlayerRolling =
    diceState?.isRolling && diceState.rollingPlayerId && diceState.rollingPlayerId !== myPlayerId;

  const isNotMyTurn = !isMyTurn;

  return (
    <div className="flex flex-col items-center gap-1 md:gap-4 w-full">
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

        {/* Roll button - Only show when it's my turn and no one is rolling */}
        {isMyTurn && !isOtherPlayerRolling && (
          <button
            onClick={handleRollClick}
            disabled={disabled || isLocalRolling}
            className="px-3 py-1 lg:px-5 lg:py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold text-[12px] lg:text-sm rounded lg:rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap disabled:cursor-not-allowed"
          >
            {isLocalRolling ? 'Rolling...' : 'Roll'}
          </button>
        )}
      </div>
    </div>
  );
}
