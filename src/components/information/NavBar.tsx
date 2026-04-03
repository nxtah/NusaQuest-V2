"use client";
import React, { useState } from "react";
import { information } from "../../assets/images/information/cloudinaryAssets";
import Image from "next/image";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Poppins } from "next/font/google";

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
            className={`flex flex-row items-center justify-between w-full px-8 py-2 lg:py-3 gap-2 lg:gap-0 z-20 relative ${poppins.className}`}
        >
            <div className="flex items-center gap-1.5 lg:gap-4 w-full min-w-0 flex-1 lg:pr-4">
                {/* Tombol Kembali */}
                <Link
                    href="/home"
                    className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 shrink-0 flex items-center justify-center bg-white/5 backdrop-blur-lg text-white border border-white rounded-full hover:bg-white/20"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                        />
                    </svg>
                </Link>

                {/* List Menu Kategori */}
                <div className="flex gap-1 lg:gap-2 overflow-x-auto scrollbar-hide w-full items-center">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                router.push("/information?category=" + category);
                            }}
                            className={`px-3 lg:px-6 h-6 sm:h-8 lg:h-10 flex items-center justify-center text-[9px] sm:text-xs lg:text-base rounded-full whitespace-nowrap shrink-0 backdrop-blur-lg border ${
                                activeCategory === category
                                ? "bg-cyan-700 hover:bg-cyan-700/70"
                                : "bg-white/5 hover:bg-white/20"
                            } text-white`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-[100px] sm:w-[112px] lg:w-auto shrink-0 mt-0">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-3 h-3 lg:w-5 lg:h-5 absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none z-10"
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
                    className="w-full lg:w-96 pl-6 lg:pl-10 pr-2 lg:pr-4 h-6 sm:h-8 lg:h-10 flex items-center text-[9px] sm:text-xs lg:text-base bg-white/5 backdrop-blur-lg border border-white/70 rounded-full text-white placeholder-white/70 outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                />
            </div>
        </div>
    );
}
