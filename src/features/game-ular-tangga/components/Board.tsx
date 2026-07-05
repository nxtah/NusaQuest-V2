"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage } from "react-konva";
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
        let squares = [];
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
                let color = (i + j) % 2 === 0 ? "#FD9502" : "#CDCDAB";
                squares.push(
                    <Rect
                        key={`${i}-${j}`}
                        x={j * cellSize}
                        y={i * cellSize}
                        width={cellSize}
                        height={cellSize}
                        fill={color}
                    />
                );
                squares.push(
                    <Text
                        key={`text-${i}-${j}`}
                        x={j * cellSize + cellSize / 2}
                        y={i * cellSize + cellSize / 2}
                        text={number.toString()}
                        fontSize={Math.max(cellSize / 7, 8)}
                        fill="black"
                        align="center"
                        verticalAlign="middle"
                        offsetX={cellSize / 2.5}
                        offsetY={cellSize / 2.5}
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
            <div className="relative bg-[#602919] p-[3vmin] rounded-[3vmin] shadow-2xl -translate-x-4 md:translate-x-0">
                {/* Kontainer pion yang belum berjalan */}
                <div className="absolute bottom-3 left-0 -translate-x-[110%] md:-translate-x-[120%] grid grid-cols-2 gap-1 md:gap-2 z-30">
                    {pionImages.map((img, index) => {
                        if (img && pionPositionIndexes[index] === -1) {
                            
                            const aspectRatio = img.width / img.height;
                            const pionHeight = cellSize * 0.7;
                            const pionWidth = pionHeight * aspectRatio;

                            return (
                                <img
                                    key={`idle-pion-${index}`}
                                    src={img.src}
                                    alt={`Pion ${index}`}
                                    className="object-contain transition-transform hover:scale-110 drop-shadow-[2px_4px_6px_rgba(0,0,0,0.6)]"
                                    style={{
                                        width: pionWidth,
                                        height: pionHeight,
                                    }}
                                />
                            );
                        }
                        return null;
                    })}
                </div>

                <Stage width={stageSize.width} height={stageSize.height}>
                    <Layer>
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
                                />
                            );
                        })}

                        {/* Gambar Pion */}
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
