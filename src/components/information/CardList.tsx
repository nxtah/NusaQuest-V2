import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { Irish_Grover } from "next/font/google";
import { information } from "../../assets/images/information/cloudinaryAssets";

const poppins = Poppins({
    subsets: ["latin"],
    weight: "600",
});

const irishGrover = Irish_Grover({
    subsets: ["latin"],
    weight: "400",
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

            {/* Card List */}
            <div className="flex flex-wrap gap-3 sm:gap-5 lg:gap-8">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`/information/${item.id}`}
                        className="relative flex flex-col items-center justify-start p-1.5 lg:p-3 w-28 h-36 sm:w-36 sm:h-48 lg:w-48 lg:h-60 hover:scale-105 transition-transform cursor-pointer"
                    >
                        {/* Card Container */}
                        <Image
                            src={information.informationCard}
                            alt="Information Card"
                            fill
                            className="object-fill -z-10 drop-shadow-md rounded-lg lg:rounded-xl"
                        />

                        {/* Image Section */}
                        <div className="relative h-20 sm:h-32 lg:h-40 w-32 sm:w-32 lg:w-full rounded-md lg:rounded-lg overflow-hidden border border-black mb-1 sm:mb-2 lg:mb-3">
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Title Section */}
                        <h3 className={`text-white text-center text-[10px] sm:text-xs lg:text-base tracking-wide ${irishGrover.className}`}>
                            {item.title}
                        </h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
