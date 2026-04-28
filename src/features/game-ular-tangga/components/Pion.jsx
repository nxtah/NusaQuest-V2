import React, { useEffect, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import gsap from "gsap";

export default function Pion({
    desiredIndex,
    cellSize,
    getPosition,
    image,
    index,
    onAnimationComplete,
    tanggaUp,
    snakesDown,
    isCorrect,
}) {
    const imageRef = useRef(null);
    const [positionIndex, setPositionIndex] = useState(desiredIndex);
    const isAnimating = useRef(false);

    useEffect(() => {
        if(!imageRef.current) return;

        const node = imageRef.current;

        if (positionIndex === desiredIndex || isAnimating.current) return;

        gsap.killTweensOf(node);
        isAnimating.current = true;

        const moveToIndex = (targetIndex) => {
            const targetPos = getPosition(targetIndex);

            if (tanggaUp[positionIndex] && isCorrect) {
                gsap.to(node, {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 0.5,
                    ease: "power1.out",
                    onComplete: () => {
                        setPositionIndex(targetIndex);
                        isAnimating.current = false;
                        if (onAnimationComplete) {
                            onAnimatingComplete(index, targetIndex);
                        }
                    },
                });
            } else if (snakesDown[positionIndex]) {
                gsap.to(node, {
                    x: targetPos.x,
                    y: targetPos.y,
                    duration: 0.5,
                    ease: "power1.out",
                    onComplete: () => {
                        setPositionIndex(targetIndex);
                        isAnimating.current = false;
                        if (onAnimationComplete) {
                            onAnimationComplete(index, targetIndex)
                        }
                    }
                });
            } else {
                gsap.to(node, {
                    x: targetPos.x,
                    y: targetPos.y, 
                    duration: 0.3,
                    ease: "none",
                    onComplete: () => { 
                        setPositionIndex(targetIndex);
                        isAnimating.current = false;
                        if (onAnimationComplete) {
                            onAnimationComplete(index, targetIndex)
                        }
                    },
                });
            }
        };
        if(tanggaUp[positionIndex] && isCorrect) {
            moveToIndex(tanggaUp[positionIndex]);
        } else if (snakesDown[positionIndex]) {
            moveToIndex(snakesDown[positionIndex]);
        } else {
            const steps = Math.abs(desiredIndex - positionIndex);
            const direction = desiredIndex > positionIndex ? 1 : -1;

            const animateStep = (step) => {
                if (step > steps) {
                    setPositionIndex(desiredIndex);
                    isAnimating.current = false;
                    if (onAnimationComplete) {
                        onAnimationComplete(index, desiredIndex);
                    }
                    return;
                }

                const intermediateIndex = positionIndex + step * direction;
                const targetPos = getPosition(intermediateIndex);

                gsap.to(node, {
                    y: targetPos.y - 20,
                    duration: 0.22,
                    onComplete: () => {
                        gsap.to(node, {
                            x: targetPos.x,
                            y: targetPos.y,
                            duration: 0.15,
                            ease: "power1.out",
                            onComplete: () => {
                                setPositionIndex(intermediateIndex);
                                animateStep(step + 1);
                            },
                        });
                    },
                });
            };

            animateStep(1);
        }
    }, [
        desiredIndex,
        getPosition,
        index,
        onAnimationComplete,
        positionIndex,
        tanggaUp,
        isCorrect,
        snakesDown,
    ]);

    const aspectRatio = image.width / image.height;
    const pionHeight = cellSize * 0.8; 
    const pionWidth = pionHeight * aspectRatio;
    const offsetX = cellSize * 0.35;
    const offsetY = cellSize * 0.1;

    return (
        <KonvaImage
            ref={imageRef}
            x={getPosition(positionIndex).x + offsetX}
            y={getPosition(positionIndex).y + offsetY}
            width={pionWidth}
            height={pionHeight}
            image={image}
            draggable={false}
        />
    );
}