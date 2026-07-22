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
                        className="group flex flex-col items-center gap-1.5 sm:gap-2 w-full aspect-[4/5] rounded-xl sm:rounded-2xl border-2 sm:border-[3px] border-[#7fb3da] bg-[#254a68] p-1.5 sm:p-2 lg:p-2.5 shadow-lg hover:scale-105 hover:border-white transition-all cursor-pointer"
                    >
                        {/* Image Section */}
                        <div className="relative w-full flex-1 min-h-0 rounded-lg sm:rounded-xl overflow-hidden border border-black/40">
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
