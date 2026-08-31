import Image from "next/image";
import Link from "next/link";
import { information } from "../../../../assets/images/information/cloudinaryAssets";
import { background } from "../../../../assets/images/background/cloudinaryAssets";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import {
    getInformationItem,
    getInformationItemsByTab,
} from "../../../../services/firebase/firestore/information.service";
import { ROUTES } from "../../../../lib/constants/routes";
import BackButton from "../../../../components/ui/BackButton";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

const bauhausLace = localFont({
    src: "../../../../../public/fonts/Tanker.ttf",
    variable: "--font-bauhaus-lace",
});

const SUGGESTION_LIMIT = 6;
const POSTCARD_TILT = ["-2.5deg", "2deg", "-1.5deg", "2.5deg", "-2deg", "1.5deg"];

export default async function InformationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const currentId = resolvedParams.id;

    const result = await getInformationItem(currentId);
    const currentItem = result.success ? result.data : null;

    const title = currentItem?.title || "Judul Tidak Ditemukan";
    const description =
        currentItem?.description || "Deskripsi tidak tersedia untuk item ini.";
    const imageUrl = currentItem?.imageUrl || background.bgNusa;

    let suggestions: { id: string; title: string; imageUrl: string }[] = [];
    if (currentItem) {
        const tabResult = await getInformationItemsByTab(currentItem.tab);
        if (tabResult.success) {
            suggestions = tabResult.data
                .filter((item) => item.id !== currentItem.id)
                .slice(0, SUGGESTION_LIMIT);
        }
    }

    return (
        <main className={`relative h-[100dvh] w-full overflow-x-hidden overflow-y-auto ${poppins.className}`}>
            {/* Claymorphism gold tag (resep sama kayak BackButton) + entrance
                animation buat kartu jurnal + postcard sugesti. Dipisah dari
                Tailwind karena butuh gradient/shadow berlapis & keyframes. */}
            <style>{`
                .nq-tag-badge {
                    background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
                    box-shadow:
                        0 3px 0 #c6841a,
                        0 6px 10px rgba(120, 72, 0, 0.35),
                        inset -2px -2px 4px rgba(150, 90, 0, 0.25),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.65);
                }
                .nq-journal-entrance {
                    animation: nq-journal-in 560ms cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                .nq-postcard {
                    transition: transform 220ms ease-out, box-shadow 220ms ease-out;
                }
                .nq-postcard:hover, .nq-postcard:focus-visible {
                    transform: rotate(0deg) translateY(-4px) scale(1.04) !important;
                    box-shadow: 0 14px 24px rgba(38, 22, 6, 0.35);
                }
                @keyframes nq-journal-in {
                    from { opacity: 0; transform: translateY(18px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .nq-journal-entrance { animation: none; }
                    .nq-postcard { transition: none; }
                }
                .nq-photo-shadow {
                    background: radial-gradient(ellipse at center, rgba(20, 10, 0, 0.45) 0%, rgba(20, 10, 0, 0) 70%);
                }

                /* Mobile landscape (HP disamping, viewport pendek) — dikompres
                   vertikal biar gak butuh scroll segunung buat sampe ke isinya. */
                @media (max-height: 500px) and (orientation: landscape) {
                    .nq-info-content { gap: 1.75rem; padding-bottom: 2rem; }
                    .nq-info-journal { margin-top: 3rem; }
                    .nq-info-vine { width: 4.5rem; top: -1.75rem; }
                    .nq-info-vine-left { left: -1rem; }
                    .nq-info-vine-right { right: -1rem; }
                    .nq-info-board-inner { padding-top: 4.5rem; padding-bottom: 1.5rem; padding-left: 1rem; padding-right: 1rem; }
                    .nq-info-paper { padding: 1rem 1.25rem; }
                    .nq-info-title { font-size: 1.35rem; }
                    .nq-info-desc { font-size: 0.85rem; max-width: 32rem; }
                    .nq-info-photo-wrap { top: -3rem; width: 60%; }
                }
            `}</style>

            {/* Background Image */}
            <div className="fixed -inset-16 md:-inset-10 -z-10 bg-[#59a87d]">
                <Image
                    src={background.bgNusa}
                    alt="Background"
                    fill
                    className="object-cover blur-xl"
                    priority
                />
                <div className="absolute inset-0 z-10 bg-black/10"></div>
            </div>

            <div className="nq-info-content mx-4 md:mx-12 mt-4 md:mt-6 flex flex-col items-center gap-14 md:gap-20 pb-14 md:pb-20 z-10 relative">
                {/* Tombol Kembali */}
                <div className="w-full flex justify-start">
                    <BackButton href={ROUTES.public.information} iconSize="md" />
                </div>

                {/* Entri Jurnal — foto tertempel miring di atas papan kayu */}
                <div className="nq-journal-entrance nq-info-journal relative w-full max-w-5xl mt-16 md:mt-24">
                    {/* Sulur Tanaman — diskalain proporsional sama papan yang
                        sekarang lebih lebar, digeser lebih keluar biar tetep
                        nempel di sudut papan (bukan ketimpa/ketinggalan). */}
                    <Image
                        src={information.tanamankiri}
                        alt=""
                        width={220}
                        height={260}
                        className="nq-info-vine nq-info-vine-left absolute -top-14 -left-8 sm:-left-16 md:-left-24 lg:-left-28 w-24 sm:w-40 md:w-52 lg:w-60 h-auto z-0 pointer-events-none select-none"
                    />
                    <Image
                        src={information.tanamankanan}
                        alt=""
                        width={220}
                        height={260}
                        className="nq-info-vine nq-info-vine-right absolute -top-14 -right-8 sm:-right-16 md:-right-24 lg:-right-28 w-24 sm:w-40 md:w-52 lg:w-60 h-auto z-0 pointer-events-none select-none"
                    />

                    {/* Papan Kayu */}
                    <div
                        className="relative z-10 rounded-[1.75rem] sm:rounded-[2rem] border-[5px] sm:border-[6px] border-[#3d2411] shadow-2xl bg-center bg-cover"
                        style={{ backgroundImage: `url(${background.kayu})` }}
                    >
                        <div className="nq-info-board-inner rounded-[1.4rem] sm:rounded-[1.6rem] bg-black/15 px-4 pt-28 pb-8 sm:px-10 sm:pt-40 sm:pb-12 md:px-14 md:pt-44 lg:px-20 flex flex-col items-center gap-4 md:gap-6">
                            {/* Kertas — judul & deskripsi */}
                            <div
                                className="nq-info-paper relative w-full rounded-xl sm:rounded-2xl px-6 py-7 sm:px-12 sm:py-12 md:px-16 md:py-14 shadow-inner bg-center bg-cover"
                                style={{ backgroundImage: `url(${information.kertas})` }}
                            >
                                <Image
                                    src={information.melati}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="absolute top-2 left-2 sm:top-3 sm:left-3 w-7 sm:w-10 h-auto -rotate-[45deg] opacity-90 pointer-events-none select-none"
                                />
                                <Image
                                    src={information.melati}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-7 sm:w-10 h-auto rotate-[135deg] opacity-90 pointer-events-none select-none"
                                />
                                <h1
                                    className={`nq-info-title relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#3d2411] font-bold tracking-wide text-center ${bauhausLace.className}`}
                                >
                                    {title}
                                </h1>
                                <div className="relative mx-auto mt-4 mb-5 sm:mt-5 sm:mb-6 h-[3px] w-20 sm:w-28 rounded-full bg-[#c6841a]/60" />
                                <p className="nq-info-desc relative text-lg sm:text-xl md:text-2xl text-[#4a2a1a]/85 leading-relaxed text-center max-w-3xl mx-auto">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Foto — bingkai ornamen resmi (aset sama kayak yang lama),
                        ditempel miring nongol dari atas papan, kayak foto
                        dijepret ke halaman jurnal. Elips blur di baliknya
                        ngasih kesan foto "ngambang"/nempel di papan, bukan
                        cuma numpuk flat. */}
                    <div className="nq-info-photo-wrap absolute -top-16 sm:-top-24 md:-top-28 left-1/2 -translate-x-1/2 w-[88%] sm:w-[72%] max-w-3xl z-20">
                        <div
                            className="nq-photo-shadow absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%] h-8 sm:h-10 rounded-full blur-md"
                            aria-hidden="true"
                        />
                        <div
                            className="relative rotate-[-3deg] drop-shadow-2xl"
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
                                    alt={title}
                                    fill
                                    sizes="(max-width: 768px) 80vw, 600px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                            <Image
                                src={information.imagePopup}
                                alt=""
                                fill
                                className="object-contain z-20 pointer-events-none select-none"
                            />
                        </div>
                    </div>

                    {/* Label Kategori */}
                    {currentItem && (
                        <div className="absolute -top-8 sm:-top-10 right-2 sm:right-8 z-30 rotate-[6deg]">
                            <span className="nq-tag-badge inline-block px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-[10px] sm:text-sm font-bold uppercase tracking-wider text-[#4a2a1a]">
                                {currentItem.tab}
                            </span>
                        </div>
                    )}
                </div>

                {/* Sugesti — postcard nemplok di papan gabus */}
                {suggestions.length > 0 && (
                    <div className="w-full max-w-6xl">
                        <h2
                            className={`text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-center drop-shadow-md ${bauhausLace.className}`}
                        >
                            Jelajahi Lainnya
                        </h2>
                        <div className="mx-auto mt-1 mb-6 sm:mb-8 h-[3px] w-20 sm:w-24 rounded-full bg-white/50" />

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 place-items-center">
                            {suggestions.map((item, index) => (
                                <Link
                                    key={item.id}
                                    href={`/information/${item.id}`}
                                    className="nq-postcard group block w-full max-w-[9.5rem] rounded-lg bg-[#fdf6e3] p-2 pb-3 shadow-lg"
                                    style={{ transform: `rotate(${POSTCARD_TILT[index % POSTCARD_TILT.length]})` }}
                                >
                                    <div className="relative w-full aspect-square overflow-hidden rounded-sm border border-black/10">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            sizes="150px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <p className="mt-2 text-center text-[11px] sm:text-xs font-semibold text-[#4a2a1a] truncate">
                                        {item.title}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
