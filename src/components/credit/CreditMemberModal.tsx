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

    // Tab HARUS dibuka di sini, SEBELUM await apapun — browser cuma ngasih
    // izin window.open() tanpa diblokir kalau dipanggil langsung sebagai
    // respons klik ("user activation"). generateTeamStoryImage() di bawah
    // butuh waktu (load font + gambar), begitu itu di-await duluan, izin
    // klik itu udah keburu abis pas window.open() akhirnya dipanggil —
    // browser diem-diem nge-block-nya tanpa error, makanya tombolnya
    // keliatan "gak ngapa-ngapain". Buka tab kosong dulu di sini, isinya
    // baru di-set belakangan begitu blob-nya siap.
    const pendingTab = window.open("", "_blank");
    if (!pendingTab) {
      setStoryError("Izinkan pop-up di browser buat lihat story-nya ya.");
      setIsGeneratingStory(false);
      return;
    }

    try {
      const blob = await generateTeamStoryImage({
        name: memberName,
        role: memberRole,
        photoURL: memberPhotoURL,
      });
      const url = URL.createObjectURL(blob);
      pendingTab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      pendingTab.close();
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

        /* Mobile landscape — sebelumnya cuma ada breakpoint LEBAR (sm:
           640px), gak ada yang ngecilin buat TINGGI yang mepet. Di HP
           landscape (mis. 667x375), lebar udah lolos 640px jadi tata
           letak side-by-side-nya kepake, tapi ukuran teks/foto masih skala
           DESKTOP PENUH (nama text-5xl, foto 340px, dll) — kartunya jadi
           jauh lebih tinggi dari layar, numpuk butuh discroll banyak buat
           liat tombol share. Semua ukuran di bawah diturunin drastis
           khusus buat kondisi ini, !important biar pasti menang atas
           utility Tailwind yang udah nempel di elemen yang sama. */
        @media (max-height: 500px) and (orientation: landscape) {
          .nq-credit-deco2 { display: none !important; }
          .nq-credit-close2 {
            width: 1.75rem !important;
            height: 1.75rem !important;
            font-size: 1rem !important;
          }
          .nq-credit-card-frame { padding: 0.5rem !important; }
          .nq-credit-card-paper { padding: 0.75rem !important; }
          /* Tailwind switch foto+info dari tumpuk ke sejajar itu berbasis
             LEBAR (sm:flex-row, 640px) — HP landscape yang sempit (mis.
             568x320, umum di HP lama/kecil) bisa lebih SEMPIT dari 640px
             padahal orientasinya udah landscape, jadi ketimpa tetep
             ke-stack vertikal (foto di atas, info di bawah) yang jauh
             lebih tinggi dari layar. Dipaksa sejajar tanpa syarat lebar
             di kondisi landscape-pendek ini. */
          .nq-credit-modal-cols {
            flex-direction: row !important;
            align-items: center !important;
            gap: 0.75rem !important;
          }
          .nq-credit-info-col {
            align-items: flex-start !important;
            text-align: left !important;
            padding-top: 0 !important;
          }
          .nq-credit-photo-col { width: clamp(90px, 22vh, 130px) !important; }
          .nq-credit-photo-ring { padding: 0.35rem !important; }
          .nq-credit-version-tag {
            padding: 2px 8px !important;
            font-size: 0.55rem !important;
            top: 0.35rem !important;
            right: 0.35rem !important;
          }
          .nq-credit-nameplate-wrap { display: none !important; }
          .nq-credit-name { font-size: clamp(1rem, 5vh, 1.4rem) !important; }
          .nq-credit-role-chip {
            margin-top: 0.35rem !important;
            padding: 0.2rem 0.75rem !important;
            font-size: 0.65rem !important;
          }
          .nq-credit-bio-inset {
            margin-top: 0.5rem !important;
            padding: 0.5rem !important;
          }
          .nq-credit-bio-label { font-size: 0.55rem !important; }
          .nq-credit-bio-text {
            margin-top: 0.15rem !important;
            font-size: 0.7rem !important;
            line-height: 1.3 !important;
          }
          .nq-credit-magic-btn2 {
            margin-top: 0.5rem !important;
            padding: 0.5rem 1rem !important;
            font-size: 0.75rem !important;
            gap: 0.3rem !important;
          }
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
            <div className="nq-credit-modal-cols flex flex-col items-center gap-9 sm:flex-row sm:items-center">
              {/* Foto besar — kolom kiri. */}
              <div className="nq-credit-photo-col w-full shrink-0 sm:w-[340px]">
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
                    <div className="nq-credit-nameplate-wrap absolute -bottom-6 left-1/2 w-[84%] -translate-x-1/2">
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
              <div className="nq-credit-info-col flex w-full flex-1 flex-col items-center pt-2 text-center sm:items-start sm:pt-3 sm:text-left">
                <h3 className="nq-credit-name font-bauhaus text-4xl tracking-wide text-[#3d2411] sm:text-5xl">{memberName}</h3>

                <span className="nq-credit-role-chip mt-4 inline-flex items-center justify-center rounded-full px-6 py-2.5 text-base font-bold leading-none">
                  {memberRole}
                </span>

                <div className="nq-credit-bio-inset mt-6 w-full rounded-xl p-6 text-left">
                  <p className="nq-credit-bio-label text-xs font-black uppercase tracking-widest text-[#8b5e2a]">Tentang</p>
                  <p className="nq-credit-bio-text mt-2 text-lg leading-relaxed text-[#4a2a1a]">{memberBio}</p>
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
