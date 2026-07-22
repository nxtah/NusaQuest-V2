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
    // State hanya dipakai untuk initial render & force-rerender posisi akhir
    const [, forceRender] = useState(0);

    // Ref untuk posisi terkini — selalu up-to-date, tidak stale
    const positionIndexRef = useRef(desiredIndex);
    const imageRef         = useRef(null);
    const isAnimating      = useRef(false);

    const offsetX = cellSize * 0.35;
    const offsetY = cellSize * 0.1;

    useEffect(() => {
        const node = imageRef.current;
        if (!node) return;

        const fromIndex = positionIndexRef.current; // Selalu nilai terbaru

        // Tidak ada perubahan atau sedang animasi
        if (desiredIndex === fromIndex || isAnimating.current) return;

        gsap.killTweensOf(node);
        isAnimating.current = true;

        const steps     = Math.abs(desiredIndex - fromIndex);
        const direction = desiredIndex > fromIndex ? 1 : -1;
        
        // Deteksi apakah ini lompatan ular / tangga
        const isSnakeOrLadder = 
            (tanggaUp && tanggaUp.some(t => t.start === fromIndex + 1 && t.end === desiredIndex + 1)) ||
            (snakesDown && snakesDown.some(s => s.start === fromIndex + 1 && s.end === desiredIndex + 1)) ||
            steps > 6;

        // JIKA LOMPATAN ULAR / TANGGA, MELUNCUR LANGSUNG
        if (isSnakeOrLadder) {
            const targetPos = getPosition(desiredIndex);
            gsap.to(node, {
                x: targetPos.x + offsetX,
                y: targetPos.y + offsetY,
                duration: 1.2,
                ease: "power2.inOut",
                onComplete: () => {
                    positionIndexRef.current = desiredIndex;
                    isAnimating.current = false;
                    forceRender(n => n + 1);
                    if (onAnimationComplete) onAnimationComplete(index, desiredIndex);
                }
            });
            return;
        }

        let   currentStep = 0;

        const animateStep = () => {
            currentStep++;

            if (currentStep > steps) {
                // Sampai di target — update ref & paksa re-render
                positionIndexRef.current = desiredIndex;
                isAnimating.current = false;
                forceRender(n => n + 1);
                if (onAnimationComplete) onAnimationComplete(index, desiredIndex);
                return;
            }

            const intermediateIndex = fromIndex + currentStep * direction;
            const prevIndex         = fromIndex + (currentStep - 1) * direction;
            const targetPos         = getPosition(intermediateIndex);
            const prevPos           = getPosition(prevIndex);

            // Lompat sedikit ke atas lalu mendarat di kotak berikutnya
            gsap.to(node, {
                y: prevPos.y + offsetY - cellSize * 0.3,
                duration: 0.18,
                ease: "power1.out",
                onComplete: () => {
                    gsap.to(node, {
                        x: targetPos.x + offsetX,
                        y: targetPos.y + offsetY,
                        duration: 0.14,
                        ease: "power1.in",
                        onComplete: animateStep,
                    });
                },
            });
        };

        animateStep();

    }, [desiredIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync offsetX/offsetY ketika cellSize berubah (resize)
    useEffect(() => {
        const node = imageRef.current;
        if (!node || isAnimating.current) return;
        const pos = getPosition(positionIndexRef.current);
        gsap.set(node, { x: pos.x + offsetX, y: pos.y + offsetY });
    }, [cellSize, getPosition, offsetX, offsetY]);

    const aspectRatio = image.width / image.height;
    const pionHeight  = cellSize * 0.8;
    const pionWidth   = pionHeight * aspectRatio;

    const currentPos = getPosition(positionIndexRef.current);

    return (
        <KonvaImage
            ref={imageRef}
            x={currentPos.x + offsetX}
            y={currentPos.y + offsetY}
            width={pionWidth}
            height={pionHeight}
            image={image}
            draggable={false}
        />
    );
}