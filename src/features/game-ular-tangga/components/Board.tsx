"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
import type Konva from "konva";
import { ularTangga } from "../../../assets/images/ular-tangga/cloudinaryAssets";
import Pion from "./Pion";

export default function Board({
    pionPositionIndexes = [-1, -1, -1, -1],
    tanggaUp = [] as { start: number; end: number }[],
    snakesDown = [] as { start: number; end: number }[],
    isCorrect = false,
}) {
    const numRowsCols = 10;
    const [stageSize, setStageSize] = useState({ width: 900, height: 900 });
    const [cellSize, setCellSize] = useState(80);

    const [snakeImages, setSnakeImages] = useState<HTMLImageElement[]>([]);
    const [tanggaImages, setTanggaImages] = useState<HTMLImageElement[]>([]);

    const [pionImages, setPionImages] = useState<HTMLImageElement[]>([]);

    const stageRef = useRef<HTMLDivElement>(null);
    // Layer statis (kotak angka + ular + tangga) di-cache jadi satu bitmap
    // begitu gambar/ukuran siap — shadow+gradient di ~120 node itu MAHAL
    // kalau di-render ulang tiap frame (bikin lag pas pion animasi jalan),
    // padahal isinya gak pernah berubah sendiri. Layer pion TETAP hidup
    // (gak di-cache) karena emang harus animasi tiap gerakan.
    const staticLayerRef = useRef<Konva.Layer>(null);

    useEffect(() => {
        const updateSize = () => {
            if (stageRef.current) {
                const containerWidth = stageRef.current.offsetWidth;
                const containerHeight = stageRef.current.offsetHeight;
                const safeOffset = containerHeight < 500 ? 20 : 120;
                const newStageSize = Math.max(
                    Math.min(containerWidth, containerHeight) - safeOffset, 100
                )
                setStageSize({ width: newStageSize, height: newStageSize });
                const newCellSize = newStageSize / numRowsCols;
                setCellSize(newCellSize);
            }
        };

        window.addEventListener("resize", updateSize);
        updateSize();

        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const drawBoard = () => {
        const squares = [];
        let number = 1;
        for (let i = numRowsCols - 1; i >= 0; i--) {
            let startCol = 0;
            let endCol = numRowsCols - 1;
            let direction = 1;

            if ((numRowsCols - 1 - i) % 2 !== 0) {
                startCol = numRowsCols - 1;
                endCol = 0;
                direction = -1;
            }

            for (
                let j = startCol;
                direction === 1 ? j <= endCol : j >= endCol;
                j += direction
            ) {
                // Dua nada krem/emas dari palet claymorphism yang sama kayak
                // sisa app (bukan oranye/khaki lama yang gak nyambung) —
                // masing-masing kotak dikasih gradient dikit + shadow lembut
                // biar keliatan "puffy" 3D, bukan kotak flat.
                const isEven = (i + j) % 2 === 0;
                const gradientStops = isEven
                    ? [0, "#fff3cf", 1, "#f6d98a"]
                    : [0, "#ffe9b8", 1, "#e8bf72"];
                const inset = Math.max(cellSize * 0.03, 1);
                squares.push(
                    <Rect
                        key={`${i}-${j}`}
                        x={j * cellSize + inset}
                        y={i * cellSize + inset}
                        width={cellSize - inset * 2}
                        height={cellSize - inset * 2}
                        cornerRadius={cellSize * 0.16}
                        fillLinearGradientStartPoint={{x: 0, y: 0}}
                        fillLinearGradientEndPoint={{x: 0, y: cellSize}}
                        fillLinearGradientColorStops={gradientStops}
                        stroke="rgba(139, 94, 42, 0.35)"
                        strokeWidth={Math.max(cellSize * 0.015, 0.5)}
                        shadowColor="rgba(139, 94, 42, 0.5)"
                        shadowBlur={cellSize * 0.08}
                        shadowOffset={{x: 0, y: cellSize * 0.04}}
                        shadowOpacity={0.5}
                    />
                );
                squares.push(
                    <Text
                        key={`text-${i}-${j}`}
                        x={j * cellSize + cellSize / 2}
                        y={i * cellSize + cellSize / 2}
                        text={number.toString()}
                        fontSize={Math.max(cellSize / 7, 8)}
                        fontStyle="bold"
                        fill="#4a2a1a"
                        align="center"
                        verticalAlign="middle"
                        offsetX={cellSize / 2.5}
                        offsetY={cellSize / 2.5}
                        shadowColor="rgba(255, 255, 255, 0.6)"
                        shadowOffset={{x: 0, y: 1}}
                        shadowOpacity={0.8}
                    />
                );
                number++;
            }
        }
        return squares;
    };

    useEffect(() => {
        const loadImage = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve) => {
                const img = new window.Image();
                img.src = src;
                img.onload = () => resolve(img);
            });

        const loadAllImages = async () => {
            const snakeSrcs = [
                ularTangga.ular1,
                ularTangga.ular2,
                ularTangga.ular3,
                ularTangga.ular4,
                ularTangga.ular5,
                ularTangga.ular6,
                ularTangga.ular7,
                ularTangga.ular8,
            ];
            const tanggaSrcs = [
                ularTangga.tangga1,
                ularTangga.tangga2,
                ularTangga.tangga3,
                ularTangga.tangga4,
                ularTangga.tangga5,
                ularTangga.tangga6,
                ularTangga.tangga7,
                ularTangga.tangga8,
                ularTangga.tangga1,
            ];
            const pionSrcs = [
                ularTangga.pion1,
                ularTangga.pion2,
                ularTangga.pion3,
                ularTangga.pion4,
            ];

            const loadedSnakes = await Promise.all(snakeSrcs.map(loadImage));
            const loadedTanggas = await Promise.all(tanggaSrcs.map(loadImage));
            const loadedPions = await Promise.all(pionSrcs.map(loadImage));

            setSnakeImages(loadedSnakes);
            setTanggaImages(loadedTanggas);
            setPionImages(loadedPions);
        };

        loadAllImages();
    }, []);

    // Re-cache layer statis tiap kali tampilannya beneran berubah (ukuran
    // papan atau gambar ular/tangga baru kelar dimuat) — nunggu 1 frame biar
    // Konva udah selesai nge-draw node-node barunya dulu sebelum di-snapshot.
    useEffect(() => {
        const layer = staticLayerRef.current;
        if (!layer || cellSize <= 0) return;
        const raf = requestAnimationFrame(() => {
            layer.clearCache();
            layer.cache();
            layer.batchDraw();
        });
        return () => cancelAnimationFrame(raf);
    }, [cellSize, snakeImages, tanggaImages]);

    const getPosition = useCallback(
        (index: number) => {
            const row = Math.floor(index / numRowsCols);
            let col;
            if (row % 2 === 0) {
                col = index % numRowsCols;
            } else {
                col = numRowsCols - 1 - (index % numRowsCols);
            }
            const x = col * cellSize;
            const y = (numRowsCols - 1 - row) * cellSize;
            return { x, y };
        },
        [numRowsCols, cellSize]
    );

    return (
        <div
            ref={stageRef}
            className="relative flex items-center justify-center w-full h-full px-2 md:xp-8 z-20"
        >
            <style>{`
                .nq-ut-board-frame {
                    background-image: url(${ularTangga.kayu});
                    background-size: cover;
                    background-position: center;
                    box-shadow:
                        0 16px 32px rgba(0, 0, 0, 0.45),
                        inset 0 0 0 3px rgba(255, 255, 255, 0.12);
                }
                .nq-ut-idle-pion-ring {
                    background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
                    box-shadow:
                        0 6px 14px rgba(120, 72, 0, 0.4),
                        0 0 0 3px rgba(255, 255, 255, 0.5) inset;
                    transition: transform 150ms ease-out;
                }
                .nq-ut-idle-pion-ring:hover {
                    transform: translateY(-2px) scale(1.06);
                }
            `}</style>
            <div className="nq-ut-board-frame relative p-[3vmin] rounded-[3vmin] -translate-x-4 md:translate-x-0">
                {/* Kontainer pion yang belum berjalan — tiap pion sekarang
                    duduk di atas "koin clay" bercincin emas, bukan cuma
                    drop-shadow polos. */}
                <div className="absolute bottom-3 left-0 -translate-x-[110%] md:-translate-x-[120%] grid grid-cols-2 gap-1.5 md:gap-2.5 z-30">
                    {pionImages.map((img, index) => {
                        if (img && pionPositionIndexes[index] === -1) {

                            const aspectRatio = img.width / img.height;
                            const pionHeight = cellSize * 0.55;
                            const pionWidth = pionHeight * aspectRatio;
                            const badgeSize = cellSize * 0.85;

                            return (
                                <div
                                    key={`idle-pion-${index}`}
                                    className="nq-ut-idle-pion-ring flex items-center justify-center rounded-full"
                                    style={{width: badgeSize, height: badgeSize, padding: badgeSize * 0.08}}
                                >
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#fdf6e3]">
                                        <img
                                            src={img.src}
                                            alt={`Pion ${index}`}
                                            className="object-contain"
                                            style={{
                                                width: pionWidth,
                                                height: pionHeight,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                <Stage width={stageSize.width} height={stageSize.height}>
                    {/* Layer statis — di-cache jadi bitmap (lihat effect di
                        atas), gak animasi tiap frame, jadi shadow/gradient-nya
                        murah walau ada ~120 node di dalamnya. */}
                    <Layer ref={staticLayerRef} listening={false}>
                        {drawBoard()}

                        {/* Gambar Ular */}
                        {snakeImages.map((img, index) => {
                            if (!img) return null;
                            const positions = [
                                {
                                    x: 1.2 * cellSize,
                                    y: 7.3 * cellSize,
                                    height: 2.3 * cellSize,
                                },
                                {
                                    x: 6.2 * cellSize,
                                    y: 0.5 * cellSize,
                                    height: 2.8 * cellSize,
                                },
                                {
                                    x: 8.3 * cellSize,
                                    y: 0.5 * cellSize,
                                    height: 4.8 * cellSize,
                                },
                                {
                                    x: 3.5 * cellSize,
                                    y: 3.4 * cellSize,
                                    height: 2.2 * cellSize,
                                },
                                {
                                    x: 6.3 * cellSize,
                                    y: 3.5 * cellSize,
                                    height: 5.1 * cellSize,
                                },
                                {
                                    x: 8.4 * cellSize,
                                    y: 7.4 * cellSize,
                                    height: 2.3 * cellSize,
                                },
                                {
                                    x: 1.5 * cellSize,
                                    y: 0.5 * cellSize,
                                    height: 2.3 * cellSize,
                                },
                                {
                                    x: 1.4 * cellSize,
                                    y: 4.4 * cellSize,
                                    height: 2.2 * cellSize,
                                },
                            ];

                            const pos = positions[index] || {
                                x: 0,
                                y: 0,
                                width: cellSize,
                                height: cellSize,
                            };

                            const aspectRatio = img.width / img.height;
                            const calculatedWidth = pos.height * aspectRatio;

                            return (
                                <KonvaImage
                                    key={`snake-${index}`}
                                    x={pos.x}
                                    y={pos.y}
                                    width={calculatedWidth}
                                    height={pos.height}
                                    image={img}
                                    shadowColor="rgba(0, 0, 0, 0.4)"
                                    shadowBlur={cellSize * 0.12}
                                    shadowOffset={{x: cellSize * 0.03, y: cellSize * 0.05}}
                                    shadowOpacity={0.5}
                                />
                            );
                        })}

                        {/* Gambar Tangga */}
                        {tanggaImages.map((img, index) => {
                            if (!img) return null;
                            const positions = [
                                {
                                    x: 0.2 * cellSize,
                                    y: 1.6 * cellSize,
                                    height: 2 * cellSize,
                                },
                                {
                                    x: 0.3 * cellSize,
                                    y: 4.4 * cellSize,
                                    height: 5 * cellSize,
                                },
                                {
                                    x: 9.3 * cellSize,
                                    y: 3.3 * cellSize,
                                    height: 2.4 * cellSize,
                                },
                                {
                                    x: 3.1 * cellSize,
                                    y: 3.5 * cellSize,
                                    height: 5 * cellSize,
                                },
                                {
                                    x: 5.3 * cellSize,
                                    y: 0.1 * cellSize,
                                    height: 1.7 * cellSize,
                                },
                                {
                                    x: 7.2 * cellSize,
                                    y: 5.5 * cellSize,
                                    height: 2 * cellSize,
                                },
                                {
                                    x: 4.3 * cellSize,
                                    y: 2.2 * cellSize,
                                    height: 1.7 * cellSize,
                                },
                                {
                                    x: 7.2 * cellSize,
                                    y: 1.3 * cellSize,
                                    height: 1.5 * cellSize,
                                },
                                {
                                    x: 4.3 * cellSize,
                                    y: 7.8 * cellSize,
                                    height: 2 * cellSize,
                                },
                            ];

                            const pos = positions[index] || {
                                x: 0,
                                y: 0,
                                width: cellSize,
                                height: cellSize,
                            };

                            const aspectRatio = img.width / img.height;
                            const calculatedWidth = pos.height * aspectRatio;

                            return (
                                <KonvaImage
                                    key={`tangga-${index}`}
                                    x={pos.x}
                                    y={pos.y}
                                    width={calculatedWidth}
                                    height={pos.height}
                                    image={img}
                                    shadowColor="rgba(0, 0, 0, 0.4)"
                                    shadowBlur={cellSize * 0.12}
                                    shadowOffset={{x: cellSize * 0.03, y: cellSize * 0.05}}
                                    shadowOpacity={0.5}
                                />
                            );
                        })}
                    </Layer>

                    {/* Layer pion — TIDAK di-cache, karena ini yang beneran
                        animasi tiap gerakan (GSAP tween tiap frame). Dipisah
                        dari layer statis di atas biar Konva cuma perlu
                        re-draw grup kecil ini, bukan seluruh papan. */}
                    <Layer listening={false}>
                        {pionImages.map((img, index) => {
                            if (
                                !img ||
                                pionPositionIndexes[index] === undefined ||
                                pionPositionIndexes[index] < 0
                            )
                                return null;

                            return (
                                <Pion
                                    key={`pion-${index}`}
                                    desiredIndex={pionPositionIndexes[index]}
                                    cellSize={cellSize}
                                    getPosition={getPosition}
                                    image={img}
                                    index={index}
                                    onAnimationComplete={() => {}}
                                    tanggaUp={tanggaUp}
                                    snakesDown={snakesDown}
                                    isCorrect={isCorrect}
                                />
                            );
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
