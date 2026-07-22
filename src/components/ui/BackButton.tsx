"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BackButtonProps = {
  // Lokasi untuk kembali, jika tidak ada maka gunakan browser back
  href?: string;
  // Override className untuk styling custom
  className?: string;
  // Override untuk ukuran icon
  iconSize?: "sm" | "md" | "lg";
  // Custom SVG atau element
  children?: React.ReactNode;
  // Fallback href jika user tidak bisa menggunakan browser back
  fallbackHref?: string;
  // Ketika klik, trigger custom function tambahan
  onClickCallback?: () => void;
  // Aria label untuk accessibility
  ariaLabel?: string;
};

export default function BackButton({
  href,
  className,
  iconSize = "md",
  children,
  fallbackHref = "/home",
  onClickCallback,
  ariaLabel = "Kembali",
}: BackButtonProps) {
  const router = useRouter();

  // Default className dengan ukuran yang bisa dikustomisasi
  const defaultClassName =
    iconSize === "sm"
      ? "w-6 h-6 sm:w-7 sm:h-7"
      : iconSize === "lg"
        ? "w-10 h-10 sm:w-12 sm:h-12"
        : "w-8 h-8 sm:w-10 sm:h-10";

  // Claymorphism 3D kuning: gradasi puffy + shadow berlapis (slab bawah ala
  // tombol game lain di app ini + inset highlight/shadow buat kesan empuk
  // "clay"). Hover/active didefinisikan lewat CSS asli (bukan inline style)
  // biar :active beneran jalan tanpa nambah JS state.
  const buttonClass = `nq-back-btn ${defaultClassName} shrink-0 flex items-center justify-center rounded-full text-[#6B3F0A] ${className || ""}`;

  // Default SVG icon untuk back
  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.25"
      stroke="currentColor"
      className={
        iconSize === "sm"
          ? "w-3 h-3"
          : iconSize === "lg"
            ? "w-6 h-6"
            : "w-4 h-4"
      }
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
      />
    </svg>
  );

  const handleClick = () => {
    if (onClickCallback) {
      onClickCallback();
    }
  };

  const style = (
    <style>{`
      .nq-back-btn {
        background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
        box-shadow:
          0 5px 0 #c6841a,
          0 8px 14px rgba(120, 72, 0, 0.35),
          inset -3px -3px 6px rgba(150, 90, 0, 0.25),
          inset 3px 3px 5px rgba(255, 255, 255, 0.65);
        transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
      }
      .nq-back-btn:hover {
        filter: brightness(1.05);
        transform: translateY(-2px);
      }
      .nq-back-btn:active {
        transform: translateY(3px);
        filter: brightness(0.96);
        box-shadow:
          0 1px 0 #c6841a,
          0 2px 6px rgba(120, 72, 0, 0.3),
          inset -3px -3px 6px rgba(150, 90, 0, 0.25),
          inset 3px 3px 5px rgba(255, 255, 255, 0.65);
      }
    `}</style>
  );

  // Jika href diberikan, gunakan Link
  if (href) {
    return (
      <>
        {style}
        <Link href={href} className={buttonClass} aria-label={ariaLabel}>
          {children || defaultIcon}
        </Link>
      </>
    );
  }

  // Jika tidak ada href, gunakan router.back() dengan fallback
  return (
    <>
      {style}
      <button
        onClick={() => {
          handleClick();
          // Coba gunakan browser back, jika tidak bisa gunakan fallback
          if (typeof window !== "undefined") {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(fallbackHref);
            }
          }
        }}
        className={buttonClass}
        aria-label={ariaLabel}
      >
        {children || defaultIcon}
      </button>
    </>
  );
}
