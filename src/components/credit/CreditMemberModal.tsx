"use client";

import { useEffect, useRef, useState } from "react";
import { generateTeamStoryImage } from "@/src/lib/utils/generate-team-story";
import { background } from "@/src/assets/images/background/cloudinaryAssets";
import { information } from "@/src/assets/images/information/cloudinaryAssets";

type CreditMemberModalProps = {
  version: "V1" | "V2";
  memberName: string;
  memberRole: string;
  memberBio: string;
  memberPhotoURL?: string;
  /** Nama divisi (Ketua/Developer/Designer/dst) — tampil di papan nama
      kayu yang numpang di tepi bawah foto. Opsional karena anggota lama
      (pre-fitur divisi) belum tentu punya sectionId yang valid. */
  memberSection?: string;
  onClose: () => void;
};

export default function CreditMemberModal({
  version,
  memberName,
  memberRole,
  memberBio,
  memberPhotoURL,
  memberSection,
  onClose,
}: CreditMemberModalProps) {
  const ANIMATION_MS = 360;
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsOpen(true));
    return () => {
      cancelAnimationFrame(frameId);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // "Magic" — generate twibbon story (9:16) buat member ini, foto asli
  // digambar UTUH pake rasio aslinya (bukan crop paksa jadi 9:16), lalu
  // dibuka di tab baru — dari situ orangnya tinggal simpan/share ke story.
  const handleGenerateStory = async () => {
    if (!memberPhotoURL || isGeneratingStory) return;
    setIsGeneratingStory(true);
    setStoryError(null);
    try {
      const blob = await generateTeamStoryImage({
        name: memberName,
        role: memberRole,
        photoURL: memberPhotoURL,
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setStoryError(err instanceof Error ? err.message : "Gagal membuat gambar story.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleRequestClose = () => {
    if (!isOpen || closeTimerRef.current) {
      return;
    }

    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, ANIMATION_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-30 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      role="presentation"
      onClick={handleRequestClose}
    >
      <style>{`
        /* Bingkai kayu + kertas robek — bahan yang sama kayak QuestionModal
           & RankModal, disusun jadi kartu LEBAR (foto di satu sisi, info di
           sisi lain) — bukan panel berbentuk aneh, bukan kartu sempit
           memanjang. */
        .nq-credit-card-frame {
          background-image: url(${background.kayu});
          background-size: cover;
          background-position: center;
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.5),
            inset 0 0 0 3px rgba(255, 255, 255, 0.12);
        }
        .nq-credit-card-paper {
          background-image: url(${information.kertas});
          background-size: 100% 100%;
          background-repeat: no-repeat;
        }
        .nq-credit-close2 {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          color: #4a2a1a;
          box-shadow:
            0 3px 0 #c6841a,
            0 4px 8px rgba(120, 72, 0, 0.35),
            inset -2px -2px 4px rgba(139, 94, 42, 0.18),
            inset 2px 2px 4px rgba(255, 255, 255, 0.85);
          transition: transform 150ms ease-out;
        }
        .nq-credit-close2:hover {
          transform: rotate(90deg);
        }
        .nq-credit-version-tag {
          background: rgba(74, 42, 26, 0.85);
          color: #ffe28a;
          box-shadow: inset 0 0 0 1px rgba(255, 226, 138, 0.4);
        }
        .nq-credit-photo-ring {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          box-shadow:
            0 10px 20px rgba(0, 0, 0, 0.35),
            0 0 0 3px rgba(255, 255, 255, 0.5) inset;
        }
        .nq-credit-nameplate {
          background-image: url(${information.board1});
          background-size: 100% 100%;
          background-repeat: no-repeat;
          filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.35));
        }
        .nq-credit-role-chip {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          color: #4a2a1a;
          box-shadow:
            0 3px 0 #c6841a,
            0 5px 8px rgba(120, 72, 0, 0.3);
        }
        .nq-credit-bio-inset {
          background: rgba(255, 255, 255, 0.55);
          box-shadow: inset -2px -2px 6px rgba(139, 94, 42, 0.16), inset 2px 2px 6px rgba(255, 255, 255, 0.75);
        }
        .nq-credit-magic-btn2 {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          color: #4a2a1a;
          box-shadow:
            0 5px 0 #c6841a,
            0 8px 14px rgba(120, 72, 0, 0.35),
            inset -3px -3px 6px rgba(150, 90, 0, 0.25),
            inset 3px 3px 5px rgba(255, 255, 255, 0.65);
          transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
        }
        .nq-credit-magic-btn2:not(:disabled):hover {
          filter: brightness(1.05);
          transform: translateY(-2px);
        }
        .nq-credit-magic-btn2:not(:disabled):active {
          transform: translateY(2px);
        }
        .nq-credit-magic-btn2:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .nq-credit-deco2 {
          position: absolute;
          pointer-events: none;
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25));
        }
      `}</style>

      {/* Wrapper flex min-h-full — biar kartu tetep di tengah kalau muat,
          TAPI kalau layar pendek (mis. mobile landscape) kartu gak
          kepotong: dia jadi ikutan scroll bareng backdrop-nya, bukan
          ke-clip diam-diam. */}
      <div className="flex min-h-full items-end justify-center sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${memberName}`}
        className={`relative w-full max-w-4xl origin-top transform-gpu transition-all duration-300 will-change-transform ${
          isOpen
            ? "opacity-100 [transform:perspective(1200px)_rotateX(0deg)_scale(1)_translateY(0)]"
            : "opacity-0 [transform:perspective(1200px)_rotateX(-12deg)_scale(0.92)_translateY(24px)]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Rambatan sepasang — daun kiri & kanan yang emang dibikin buat
            berpasangan, ngegantung dari 2 pojok atas biar seimbang, bukan
            numpuk di satu sisi doang. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={information.tanamankiri}
          alt=""
          aria-hidden="true"
          className="nq-credit-deco2 -left-8 -top-10 z-10 hidden w-48 sm:block md:w-56"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={information.tanamankanan}
          alt=""
          aria-hidden="true"
          className="nq-credit-deco2 -right-8 -top-10 z-10 hidden w-48 sm:block md:w-56"
        />

        <button
          type="button"
          onClick={handleRequestClose}
          aria-label="Tutup popup"
          className="nq-credit-close2 absolute -right-3 -top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full text-2xl font-bold"
        >
          ×
        </button>

        {/* Kartu — bingkai kayu di luar, kertas robek di dalam, LEBAR:
            foto di satu sisi, info di sisi lain. */}
        <div className="nq-credit-card-frame rounded-[30px] p-4">
          <div className="nq-credit-card-paper relative overflow-visible rounded-[24px] p-7">
            <div className="flex flex-col items-center gap-9 sm:flex-row sm:items-center">
              {/* Foto besar — kolom kiri. */}
              <div className="w-full shrink-0 sm:w-[340px]">
                <div className="nq-credit-photo-ring relative mx-auto aspect-[4/5] w-full max-w-[340px] rounded-2xl p-2.5">
                  <div className="h-full w-full overflow-hidden rounded-xl bg-[#fdf6e3]">
                    {memberPhotoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={memberPhotoURL} alt={memberName} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <span className="nq-credit-version-tag absolute right-3 top-3 z-10 rounded-full px-3.5 py-1.5 text-sm font-black tracking-widest">
                    {version}
                  </span>

                  {/* Papan nama divisi — numpang di tepi bawah foto,
                      diapit daun kecil di kanan-kiri. Gambar papannya
                      (board1) punya margin transparan GEDE di bawah (blok
                      kayu solidnya cuma ~8-194 dari tinggi 351px kalau
                      dicek per-pixel), jadi pusat visualnya di ~29% dari
                      atas — bukan 50% (ketengahan kotak) ataupun 38%
                      (masih kebawahan) — baru bener-bener nempel di
                      permukaan kayunya. */}
                  {memberSection && (
                    <div className="absolute -bottom-6 left-1/2 w-[84%] -translate-x-1/2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={information.teratai}
                        alt=""
                        aria-hidden="true"
                        className="nq-credit-deco2 -left-6 top-[29%] w-14 -translate-y-1/2 -scale-x-100"
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={information.teratai}
                        alt=""
                        aria-hidden="true"
                        className="nq-credit-deco2 -right-6 top-[29%] w-14 -translate-y-1/2"
                      />
                      <div className="nq-credit-nameplate relative aspect-[1042/351] w-full">
                        <p className="font-bauhaus absolute left-1/2 top-[29%] w-full -translate-x-1/2 -translate-y-1/2 text-center text-xl uppercase tracking-wider text-white sm:text-2xl">
                          {memberSection}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info — kolom kanan. */}
              <div className="flex w-full flex-1 flex-col items-center pt-2 text-center sm:items-start sm:pt-3 sm:text-left">
                <h3 className="font-bauhaus text-4xl tracking-wide text-[#3d2411] sm:text-5xl">{memberName}</h3>

                <span className="nq-credit-role-chip mt-4 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-base font-bold leading-none">
                  {memberRole}
                </span>

                <div className="nq-credit-bio-inset mt-6 w-full rounded-xl p-6 text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-[#8b5e2a]">Tentang</p>
                  <p className="mt-2 text-lg leading-relaxed text-[#4a2a1a]">{memberBio}</p>
                </div>

                {memberPhotoURL && (
                  <div className="mt-6 w-full">
                    <button
                      type="button"
                      onClick={handleGenerateStory}
                      disabled={isGeneratingStory}
                      className="nq-credit-magic-btn2 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-lg font-bold"
                    >
                      ✨ {isGeneratingStory ? "Menyiapkan..." : "Bagikan ke Story"}
                    </button>
                    {storyError && (
                      <p className="mt-2 text-center text-xs font-semibold text-red-600 sm:text-left">
                        {storyError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
