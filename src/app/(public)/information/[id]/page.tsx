import Image from "next/image";
import Link from "next/link";
import { information } from "../../../../assets/images/information/cloudinaryAssets";
import { background } from "../../../../assets/images/background/cloudinaryAssets";
import { getInformationItem } from "../../../../services/firebase/firestore/information.service";

export default async function InformationPicturePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const currentId = resolvedParams.id;

    const result = await getInformationItem(currentId);
    const currentItem = result.success ? result.data : null;

    const imageUrl = currentItem?.imageUrl || background.bgNusa;

    return (
        <main className="relative flex items-center justify-center h-[100dvh] w-full p-8 overflow-hidden">
            {/* Overlay untuk Rotasi Perangkat */}

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
                {/* Image Container — aspect ratio matches the frame asset's own
                    (2490x984 ≈ 2.53:1), not a guessed value.
                    The mask asset (imagePopupMask, 2456x948) and the visible
                    frame asset (imagePopup, 2490x984) are two SEPARATE files
                    with slightly different intrinsic ratios (2.591 vs 2.530).
                    Sizing each with `contain` — which fits using each asset's
                    OWN ratio — let them drift apart by a few percent, so the
                    mask's cutout edge landed in a different place than the
                    frame's drawn border, letting a sliver of unmasked photo
                    show through the gap. Stretching both to a fixed "100% 100%"
                    forces them onto the exact same box regardless of their
                    individual source ratios, so the cutout and the border
                    can't drift relative to each other (the ~1-4% non-uniform
                    scale this introduces is not visible). */}
                <div
                    className="relative sm:w-[90%] lg:w-full max-w-full max-h-full flex items-center justify-center"
                    style={{ aspectRatio: "2490 / 984" }}
                >
                    <div
                        className="absolute inset-0 z-10 overflow-hidden"
                        style={{
                            WebkitMaskImage: `url(${information.imagePopupMask})`,
                            maskImage: `url(${information.imagePopupMask})`,
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskSize: "100% 100%",
                            maskSize: "100% 100%",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
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
