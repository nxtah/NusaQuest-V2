'use client';

import { Poppins } from 'next/font/google';
import { nuca } from '@/src/assets/images/nuca/cloudinaryAssets';
import { information } from '@/src/assets/images/information/cloudinaryAssets';
import { getLogoImage, popup } from '@/src/assets/images/home/cloudinaryAssets';
import { badge, attribut } from '@/src/assets/images/badge/cloudinaryAssets';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

interface WelcomeIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HIGHLIGHTS = [
  { icon: popup.nucaIcon, label: 'NusaCard', desc: 'Kartu + tanya-jawab' },
  { icon: popup.ularTanggaIcon, label: 'Ular Tangga', desc: 'Papan + tanya-jawab' },
  { icon: badge.gold1, label: 'Badge', desc: 'Hadiah tiap menang' },
  { icon: attribut.potion1, label: 'Potion', desc: 'Skill bantu jawab' },
];

export default function WelcomeIntroModal({ isOpen, onClose }: WelcomeIntroModalProps) {
  if (!isOpen) return null;

  return (
    // Scroll ditaruh di OVERLAY paling luar (bukan di kartu) — kalau kontennya
    // lebih tinggi dari viewport, yang discroll ini keseluruhan layer,
    // BUKAN kartu doang, biar dekorasi yang nongol di luar kartu (pita judul)
    // gak ke-crop sama batas box kartu.
    <div className={`${poppins.className} fixed inset-0 z-[999] overflow-y-auto bg-black/70 backdrop-blur-sm`}>
      <style>{`
        .nq-welcome-frame {
          background-image: url(${nuca.kayu});
          background-size: cover;
          background-position: center;
          box-shadow:
            0 20px 44px rgba(0, 0, 0, 0.5),
            inset 0 0 0 4px rgba(255, 255, 255, 0.12);
        }
        .nq-welcome-ribbon {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          color: #4a2a1a;
          box-shadow:
            0 5px 0 #c6841a,
            0 8px 16px rgba(120, 72, 0, 0.4);
        }
        .nq-welcome-logo-glow {
          background: radial-gradient(closest-side, rgba(255, 201, 60, 0.55), rgba(255, 201, 60, 0) 70%);
          animation: nq-welcome-glow-pulse 2.6s ease-in-out infinite;
        }
        @keyframes nq-welcome-glow-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        .nq-welcome-divider {
          background: linear-gradient(90deg, rgba(198, 132, 26, 0) 0%, rgba(198, 132, 26, 0.6) 50%, rgba(198, 132, 26, 0) 100%);
        }
        .nq-welcome-chip {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          box-shadow:
            0 4px 8px rgba(139, 94, 42, 0.28),
            inset -2px -2px 4px rgba(139, 94, 42, 0.18),
            inset 2px 2px 4px rgba(255, 255, 255, 0.85);
          transition: transform 150ms ease-out, box-shadow 150ms ease-out;
        }
        .nq-welcome-chip:hover {
          transform: translateY(-3px);
        }
        .nq-welcome-cta {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          color: #4a2a1a;
          box-shadow:
            0 6px 0 #c6841a,
            0 10px 18px rgba(120, 72, 0, 0.35),
            inset -3px -3px 6px rgba(150, 90, 0, 0.25),
            inset 3px 3px 5px rgba(255, 255, 255, 0.65);
          transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
        }
        .nq-welcome-cta:hover {
          filter: brightness(1.05);
          transform: translateY(-2px);
        }
        .nq-welcome-cta:active {
          transform: translateY(3px);
          box-shadow:
            0 3px 0 #c6841a,
            0 5px 10px rgba(120, 72, 0, 0.3),
            inset -3px -3px 6px rgba(150, 90, 0, 0.25),
            inset 3px 3px 5px rgba(255, 255, 255, 0.65);
        }
      `}</style>

      <div className="min-h-full flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="relative w-full max-w-3xl animate-in zoom-in duration-300 ease-out">
          <div className="nq-welcome-frame rounded-[32px] p-[clamp(10px,1.6vw,16px)] pt-8 sm:pt-9">
            {/* Pita judul emas — nempel di atas bingkai kayu, resep yang sama
                kayak modal "Pilih Game"/EditProfileModal, bukan lagi teks
                polos di dalam kertas. */}
            <div className="relative flex justify-center -mt-[3.6rem] sm:-mt-[4.2rem] mb-3 sm:mb-4">
              <span className="nq-welcome-ribbon font-bauhaus inline-block px-6 py-3 sm:px-9 sm:py-3.5 rounded-full text-lg sm:text-2xl tracking-wide whitespace-nowrap">
                Selamat Datang di NusaQuest!
              </span>
            </div>

            <div
              className="relative overflow-visible rounded-[26px] px-6 py-8 sm:px-14 sm:py-10 flex flex-col items-center gap-5 sm:gap-6 bg-center bg-cover"
              style={{ backgroundImage: `url(${information.kertas})` }}
            >
              <div className="relative flex flex-col items-center -mt-2">
                <span className="nq-welcome-logo-glow pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 sm:h-36 sm:w-36 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                <img
                  src={getLogoImage('nusaquest')}
                  alt="NusaQuest"
                  className="relative w-32 sm:w-40 h-auto"
                />
              </div>

              <p className="text-[#4a2a1a]/85 text-base sm:text-lg md:text-xl text-center leading-relaxed max-w-2xl font-medium">
                NusaQuest ngajak kamu menjelajahi budaya dan geografi 34
                provinsi Indonesia — kuliner, musik, tari, sejarah, alam,
                sampai tradisinya. Dibuat oleh Tim NusaQuest, mahasiswa
                Universitas Pembangunan Jaya (UPJ), sebagai proyek edukasi
                budaya Nusantara.
              </p>

              <div className="nq-welcome-divider h-[2px] w-full max-w-md" aria-hidden="true" />

              <p className="text-[#6b3f0a] text-xs sm:text-sm font-bold uppercase tracking-[0.15em] -mb-2">
                Yang Bisa Kamu Coba
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-xl">
                {HIGHLIGHTS.map((item) => (
                  <div
                    key={item.label}
                    className="nq-welcome-chip flex flex-col items-center gap-1.5 rounded-2xl px-3 py-4 sm:py-5"
                  >
                    <img src={item.icon} alt="" className="h-12 w-12 sm:h-14 sm:w-14 object-contain" />
                    <span className="text-xs sm:text-sm font-bold text-[#4a2a1a] text-center leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#4a2a1a]/70 text-center leading-tight">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="nq-welcome-cta mt-2 px-10 py-4 rounded-full font-extrabold text-base sm:text-lg"
              >
                Ayo Mulai Jelajahi!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
