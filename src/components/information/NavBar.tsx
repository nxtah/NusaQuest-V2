"use client";
import React, { useState } from "react";
import { information } from "../../assets/images/information/cloudinaryAssets";
import Image from "next/image";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";
import BackButton from "../ui/BackButton";

const poppins = Poppins({
    subsets: ["latin"],
    weight: "400",
});

export default function NavBar() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const activeCategory = searchParams.get("category") || "Daerah";

    const categories = [
        "Daerah",
        "Kuliner",
        "Bahari",
        "Pariwisata Darat",
        "Permainan Daerah",
    ];

    return (
        <div
            className={`flex flex-row items-center justify-between w-full lg:px-8 sm:p-4 py-2 lg:py-3 gap-2 lg:gap-0 z-20 relative ${poppins.className}`}
        >
            {/* Claymorphism — resep sama kayak search bar modal provinsi/BackButton
                (gradasi krem puffy + shadow berlapis), pindah dari glass/translucent
                putih generik. Filter aktif dikasih gradasi hijau-teal biar beda
                jelas dari yang inactive. */}
            <style>{`
                .nq-filter-pill {
                    background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
                    color: #4a2a1a;
                    box-shadow:
                        0 3px 6px rgba(139, 94, 42, 0.25),
                        inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85);
                    transition: transform 0.15s ease-out, filter 0.15s ease-out;
                }
                .nq-filter-pill:hover {
                    filter: brightness(1.03);
                    transform: translateY(-1px);
                }
                .nq-filter-pill:active {
                    transform: translateY(1px);
                }
                .nq-filter-pill--active {
                    background: linear-gradient(150deg, #6bc9ac 0%, #2f8f74 100%);
                    color: #ffffff;
                    box-shadow:
                        0 3px 6px rgba(24, 89, 71, 0.35),
                        inset -2px -2px 4px rgba(24, 89, 71, 0.25),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.4);
                }
                .nq-search-input {
                    background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
                    color: #4a2a1a;
                    border: none !important;
                    box-shadow:
                        0 3px 6px rgba(139, 94, 42, 0.25),
                        inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85);
                    transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
                }
                .nq-search-input::placeholder {
                    color: rgba(74, 42, 26, 0.55);
                }
                .nq-search-input:focus {
                    transform: translateY(-1px);
                    box-shadow:
                        0 4px 8px rgba(139, 94, 42, 0.3),
                        inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85),
                        0 0 0 3px rgba(139, 94, 42, 0.2);
                }
            `}</style>

            <div className="flex items-center gap-1.5 lg:gap-4 shrink-0 lg:flex-1 lg:min-w-0 lg:pr-4">
                {/* Tombol Kembali */}
                <BackButton href="/home" iconSize="md" />

                {/* List Menu Kategori */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full items-center">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                router.push("/information?category=" + category);
                            }}
                            className={`nq-filter-pill px-3 lg:px-6 h-6 sm:h-8 lg:h-10 flex items-center justify-center text-[9px] sm:text-xs lg:text-base rounded-full whitespace-nowrap shrink-0 font-semibold ${
                                activeCategory === category ? "nq-filter-pill--active" : ""
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 lg:flex-none min-w-[100px] sm:min-w-[120px] max-w-[160px] sm:max-w-[220px] lg:max-w-none lg:w-auto shrink-0 mt-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3 h-3 lg:w-5 lg:h-5 absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 text-[#4a2a1a]/60 pointer-events-none z-10"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>

                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearchQuery(value);
                        if (value) {
                            router.push(`/information?category=${activeCategory}&search=${value}`);
                        } else {
                            router.push(`/information?category=${activeCategory}`);
                        }
                    }}
                    className="nq-search-input w-full lg:w-96 pl-6 lg:pl-10 pr-2 lg:pr-4 h-6 sm:h-8 lg:h-10 flex items-center text-[9px] sm:text-xs lg:text-base rounded-full outline-none font-semibold"
                />
            </div>
        </div>
    );
}
