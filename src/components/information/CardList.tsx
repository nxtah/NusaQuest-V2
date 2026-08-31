import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    subsets: ["latin"],
    weight: "600",
});

interface CardItem {
    id: string | number;
    title: string;
    imageUrl: string;
}

interface CardListProps {
    subCategoryTitle: string;
    items: CardItem[];
}

export default function CardList({ subCategoryTitle, items }: CardListProps) {
    return (
        <div className="w-full px-4 lg:px-8 mb-6 lg:mb-8 z-10 relative">
            {/* Claymorphism biru — resep sama kayak gradasi krem/emas yang
                dipakai di BackButton/NavBar/WinModal (gradasi puffy + shadow
                berlapis), cuma huenya digeser ke biru biar tetep konsisten
                sama identitas kartu informasi yang udah ada. */}
            <style>{`
                .nq-info-card {
                    background: linear-gradient(150deg, #4a86b8 0%, #1e3f5c 100%);
                    box-shadow:
                        0 4px 8px rgba(10, 30, 50, 0.35),
                        inset -2px -2px 5px rgba(8, 24, 40, 0.3),
                        inset 2px 2px 5px rgba(170, 210, 240, 0.5);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
                }
                .nq-info-card:hover {
                    filter: brightness(1.06);
                    transform: translateY(-3px);
                    box-shadow:
                        0 8px 14px rgba(10, 30, 50, 0.4),
                        inset -2px -2px 5px rgba(8, 24, 40, 0.3),
                        inset 2px 2px 5px rgba(170, 210, 240, 0.5);
                }
                .nq-info-card:active {
                    transform: translateY(1px);
                    filter: brightness(0.97);
                }
            `}</style>

            {/* Sub-Category Title */}
            <h2 className={`text-white text-sm sm:text-lg lg:text-2xl mb-2 sm:mb-4 drop-shadow-md ${poppins.className}`}>
                {subCategoryTitle}
            </h2>

            {/* Card List — max 6 per row (desktop); fewer columns on narrower
                viewports; a 7th+ item wraps to the next row automatically. */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/information/${item.id}`}
                        className="nq-info-card group flex flex-col items-center gap-1.5 sm:gap-2 w-full aspect-[4/5] rounded-xl sm:rounded-2xl p-1.5 sm:p-2 lg:p-2.5 cursor-pointer"
                    >
                        {/* Image Section */}
                        <div className="relative w-full flex-1 min-h-0 rounded-lg sm:rounded-xl overflow-hidden border border-black/30">
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Title Section */}
                        <h3 className={`w-full text-white text-center text-[10px] sm:text-xs lg:text-base tracking-wide font-bold truncate ${poppins.className}`}>
                            {item.title}
                        </h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
