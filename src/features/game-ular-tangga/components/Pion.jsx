import React, { useEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Circle } from "react-konva";
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
    const groupRef         = useRef(null);
    const isAnimating      = useRef(false);

    const offsetX = cellSize * 0.35;
    const offsetY = cellSize * 0.1;

    useEffect(() => {
        const node = groupRef.current;
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
        const node = groupRef.current;
        if (!node || isAnimating.current) return;
        const pos = getPosition(positionIndexRef.current);
        gsap.set(node, { x: pos.x + offsetX, y: pos.y + offsetY });
    }, [cellSize, getPosition, offsetX, offsetY]);

    const aspectRatio = image.width / image.height;
    const pionHeight  = cellSize * 0.8;
    const pionWidth   = pionHeight * aspectRatio;

    const currentPos = getPosition(positionIndexRef.current);

    // "Koin clay" di bawah gambar pion — base bercincin emas + shadow puffy,
    // biar pion keliatan 3D duduk di atas token, bukan gambar flat doang.
    // Ukuran/posisinya relatif ke pion (bukan angka pixel absolut), jadi
    // otomatis ngikutin cellSize kayak sebelumnya. Ref & animasi GSAP-nya
    // sekarang narget GROUP ini (bukan gambar sendirian) — koordinat x/y
    // yang dihitung tetep persis sama, cuma pindah node yang digerakin.
    const baseRadius = pionWidth * 0.42;
    const baseCenterX = pionWidth / 2;
    const baseCenterY = pionHeight * 0.82;

    return (
        <Group
            ref={groupRef}
            x={currentPos.x + offsetX}
            y={currentPos.y + offsetY}
        >
            <Circle
                x={baseCenterX}
                y={baseCenterY}
                radius={baseRadius}
                fillRadialGradientStartPoint={{x: -baseRadius * 0.3, y: -baseRadius * 0.3}}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndPoint={{x: 0, y: 0}}
                fillRadialGradientEndRadius={baseRadius}
                fillRadialGradientColorStops={[0, "#ffe28a", 0.55, "#ffc93c", 1, "#f5a916"]}
                stroke="#c6841a"
                strokeWidth={Math.max(baseRadius * 0.08, 1)}
                shadowColor="rgba(120, 72, 0, 0.5)"
                shadowBlur={baseRadius * 0.35}
                shadowOffset={{x: 0, y: baseRadius * 0.18}}
                shadowOpacity={0.6}
            />
            <KonvaImage
                x={0}
                y={0}
                width={pionWidth}
                height={pionHeight}
                image={image}
                draggable={false}
            />
        </Group>
    );
}