import Image from "next/image";
import Link from "next/link";
import { information } from "../../../../assets/images/information/cloudinaryAssets";
import { background } from "../../../../assets/images/background/cloudinaryAssets";
import RotateDeviceOverlay from "../../../../components/information/RotateDeviceOverlay";

const dummyDatabase: Record<string, { subCategory: string; items: any[] }[]> = {
    Daerah: [
        {
            subCategory: "Perkotaan & Industri",
            items: [
                {
                    id: 1,
                    title: "Kota Bandung",
                    imageUrl:
                        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=500&q=80",
                },
                {
                    id: 2,
                    title: "Kota Bekasi",
                    imageUrl:
                        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&q=80",
                },
            ],
        },
        {
            subCategory: "Sejarah & Budaya",
            items: [
                {
                    id: 3,
                    title: "Gedung Sate",
                    imageUrl:
                        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=500&q=80",
                },
            ],
        },
    ],
    Kuliner: [
        {
            subCategory: "Makanan Khas",
            items: [
                {
                    id: 4,
                    title: "Soto Ayam",
                    imageUrl:
                        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=500&q=80",
                },
                {
                    id: 5,
                    title: "Nasi Goreng",
                    imageUrl:
                        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&q=80",
                },
            ],
        },
    ],
};

export default async function InformationPicturePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const currentId = resolvedParams.id;

    let currentItem = null;
    for (const category of Object.values(dummyDatabase)) {
        for (const sub of category) {
            const found = sub.items.find(
                (item) => item.id.toString() === currentId
            );
            if (found) currentItem = found;
        }
    }

    const imageUrl =
        currentItem?.imageUrl ||
        "https://images.unsplash.com/photo-1549473889-14f410d83298?w=1200&q=80";

    return (
        <main className="relative flex items-center justify-center h-[100dvh] w-full p-8 overflow-hidden">
            {/* Overlay untuk Rotasi Perangkat */}
            <RotateDeviceOverlay />
            
            {/* Background Image */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100dvw] h-[100dvh] -z-10">
                <Image
                    src={background.laut}
                    alt="Background"
                    fill
                    className="object-cover scale-125 blur-xl"
                    priority
                />
                <div className="absolute inset-0 z-10 bg-cyan-300/10"></div>
            </div>

            {/* Content */}
            <div className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center border-2 border-black p-2 sm:p-4 lg:p-8 rounded-3xl">
                {/* Image Container */}
                <div className="relative sm:w-[90%] lg:w-full max-w-full max-h-full aspect-[2.2/1] flex items-center justify-center">
                    <div 
                        className="absolute inset-0 z-10" 
                        style={{
                            WebkitMaskImage: `url(${information.imagePopupMask})`,
                            WebkitMaskRepeat: "no-repeat",
                            WebkitMaskSize: "contain",
                            WebkitMaskPosition: "center",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                        }}
                    >
                        <Image
                            src={imageUrl}
                            alt={currentItem?.title || "Content Image"}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <Image
                        src={information.imagePopup}
                        alt="Popup Container"
                        fill
                        className="object-contain z-20 drop-shadow-2xl pointer-events-none"
                    />

                    {/* Tombol Kembali */}
                    <Link
                        href="/information"
                        className="absolute left-[1%] sm:top-[5%] lg:top-[9%] sm:w-[6%] lg:w-[5%] aspect-square flex items-center justify-center rounded-full border sm:border-2 border-white/80 text-white/80 hover:bg-white/20 transition-all z-30"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-[50%] h-[50%] sm:w-[60%] sm:h-[60%]"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </Link>

                    {/* Tombol Selanjutnya */}
                    <Link
                        href={`/information/${currentId}/detail`}
                        className="absolute right-[1%] sm:top-[5%] lg:top-[9%] sm:w-[6%] lg:w-[5%] aspect-square flex items-center justify-center rounded-full border sm:border-2 border-white/80 text-white/80 hover:bg-white/20 transition-all z-30"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-[50%] h-[50%] sm:w-[60%] sm:h-[60%]"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                            />
                        </svg>
                    </Link>

                    {/* Dekorasi Bunga Melati */}
                    <div className="absolute sm:bottom-[2%] lg:bottom-[5%] -left-[1%] w-[15%] sm:w-[10%] lg:w-[10%] aspect-square z-30 pointer-events-none">
                        <Image
                            src={information.melati}
                            alt="Bunga Melati"
                            fill
                            className="object-contain -rotate-[135deg]"
                        />
                    </div>
                    <div className="absolute sm:bottom-[2%] lg:bottom-[5%] -right-[1%] w-[15%] sm:w-[10%] lg:w-[10%] aspect-square z-30 pointer-events-none">
                        <Image
                            src={information.melati}
                            alt="Bunga Melati"
                            fill
                            className="object-contain rotate-[135deg]"
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
