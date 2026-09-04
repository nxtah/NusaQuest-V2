'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { Poppins } from 'next/font/google';

import { background } from '@/src/assets/images/background/cloudinaryAssets';
import CreditMemberCard from '@/src/components/credit/CreditMemberCard';
import CreditMemberModal from '@/src/components/credit/CreditMemberModal';
import BackButton from '@/src/components/ui/BackButton';
import {
  listenToCreditMembers,
  groupCreditMembersByTeam,
  type CreditMemberRecord,
} from '@/src/services/firebase/firestore/credits.service';
import {
  listenToCreditSections,
  groupCreditSectionsByTeam,
  type CreditSectionRecord,
} from '@/src/services/firebase/firestore/credit-sections.service';

const UNSECTIONED_LABEL = 'Lainnya';

/** Kelompokin member satu Tim (V1/V2) per Divisi, urut sesuai `order`
    divisi-nya; member yang `sectionId`-nya kosong/gak match divisi manapun
    (data lama sebelum fitur ini ada) dikumpulin ke grup "Lainnya" di
    paling akhir biar tetep kelihatan, gak ilang diam-diam. */
function groupMembersBySection(
  members: CreditMemberRecord[],
  sections: CreditSectionRecord[],
): { label: string; members: CreditMemberRecord[] }[] {
  const knownIds = new Set(sections.map((s) => s.id));
  const groups = sections.map((section) => ({
    label: section.name,
    members: members
      .filter((m) => m.sectionId === section.id)
      .sort((a, b) => a.order - b.order),
  }));

  const unsectioned = members
    .filter((m) => !m.sectionId || !knownIds.has(m.sectionId))
    .sort((a, b) => a.order - b.order);

  if (unsectioned.length > 0) {
    groups.push({ label: UNSECTIONED_LABEL, members: unsectioned });
  }

  return groups.filter((group) => group.members.length > 0);
}

const bauhaus = localFont({
  src: '../../../../public/fonts/Tanker.ttf',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Page() {
  const [selectedVersion, setSelectedVersion] = useState<'V1' | 'V2'>('V1');
  const [selectedMember, setSelectedMember] = useState<CreditMemberRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<Record<'V1' | 'V2', CreditMemberRecord[]>>({ V1: [], V2: [] });
  const [sectionData, setSectionData] = useState<Record<'V1' | 'V2', CreditSectionRecord[]>>({ V1: [], V2: [] });

  // Realtime — dulu data tim hardcode di file ini, sekarang dikelola dari
  // admin panel (tab Credit) dan langsung kelihatan di sini begitu berubah.
  useEffect(() => {
    const unsub = listenToCreditMembers((members) => {
      setTeamData(groupCreditMembersByTeam(members));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = listenToCreditSections((sections) => setSectionData(groupCreditSectionsByTeam(sections)));
    return () => unsub();
  }, []);

  const sectionGroups = groupMembersBySection(teamData[selectedVersion], sectionData[selectedVersion]);

  const selectedMemberSectionName = selectedMember
    ? sectionData[selectedMember.teamVersion].find((s) => s.id === selectedMember.sectionId)?.name
    : undefined;

  return (
    <main className={`relative min-h-screen w-full overflow-x-hidden ${poppins.className}`}>
      <div className="fixed -inset-20 md:-inset-14 -z-10 bg-[#59a87d]">
        <Image
          src={background.bgNusa}
          alt="Background NusaQuest"
          fill
          className="object-cover blur-[22px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#081b23]/65 via-[#081b23]/45 to-[#081b23]/75" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <style>{`
          .nq-credit-toggle-active {
            background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
            color: #4a2a1a;
            box-shadow:
              0 4px 0 #c6841a,
              0 6px 10px rgba(120, 72, 0, 0.35),
              inset -2px -2px 4px rgba(150, 90, 0, 0.25),
              inset 2px 2px 4px rgba(255, 255, 255, 0.65);
          }
          .nq-credit-toggle-inactive {
            background: linear-gradient(150deg, #fffdf8 0%, #f3ede0 100%);
            color: #3d2411;
            box-shadow:
              0 3px 0 #d8c8a8,
              0 5px 8px rgba(120, 92, 40, 0.2),
              inset -2px -2px 4px rgba(150, 120, 60, 0.12),
              inset 2px 2px 4px rgba(255, 255, 255, 0.9);
          }
          .nq-credit-toggle-active:hover, .nq-credit-toggle-inactive:hover {
            filter: brightness(1.04);
            transform: translateY(-1px);
          }
          .nq-credit-frame {
            background-image: url(${background.kayu});
            background-size: cover;
            background-position: center;
            box-shadow:
              0 16px 32px rgba(0, 0, 0, 0.45),
              inset 0 0 0 3px rgba(255, 255, 255, 0.12);
          }
          .nq-credit-panel {
            background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
            box-shadow:
              inset -3px -3px 8px rgba(139, 94, 42, 0.14),
              inset 3px 3px 8px rgba(255, 255, 255, 0.7);
          }
          .nq-credit-list-badge {
            background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
            color: #4a2a1a;
            box-shadow:
              0 3px 0 #c6841a,
              0 5px 8px rgba(120, 72, 0, 0.35);
          }

          /* Mobile landscape — sebelumnya cuma ada breakpoint LEBAR
             (sm:/lg:), gak ada yang nyusutin buat kondisi tinggi mepet.
             Halaman ini scrollable (bukan fixed-height kayak room/login),
             jadi gak ada resiko konten "kepotong" — tapi tanpa ini,
             judul/tombol/kartu-nya kerasa gedean banget dibanding layar
             HP yang direbahin (persis keluhan "jangan kegedean"). Semua
             ukuran di bawah diturunin proporsinya khusus buat kondisi ini. */
          @media (max-height: 500px) and (orientation: landscape) {
            .nq-credit-title { font-size: clamp(1.1rem, 6vh, 1.5rem) !important; }
            .nq-credit-toggle-btn { padding: 0.3rem 0.9rem !important; font-size: 0.75rem !important; }
            .nq-credit-frame { padding: 6px !important; }
            .nq-credit-panel { padding: 0.6rem !important; }
            .nq-credit-list-badge { margin-bottom: 0.5rem !important; padding: 2px 10px !important; font-size: 0.7rem !important; }
            .nq-credit-section-label { font-size: 0.85rem !important; margin-bottom: 0.4rem !important; }
            .nq-credit-grid { gap: 0.4rem !important; }
          }
        `}</style>

        <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6 lg:left-12 lg:top-12">
          <BackButton href="/home" />
        </div>

        <header className="text-center text-white">
          <h1 className={`nq-credit-title ${bauhaus.className} text-3xl tracking-normal drop-shadow-[0_3px_8px_rgba(0,0,0,0.4)] sm:text-4xl lg:text-5xl`}>
            Tim NusaQuest
          </h1>

          <div className="mt-6 flex justify-center gap-3">
            {(['V1', 'V2'] as const).map((version) => (
              <button
                key={version}
                type="button"
                onClick={() => setSelectedVersion(version)}
                className={`nq-credit-toggle-btn rounded-full px-5 py-2 text-sm font-bold transition sm:text-base ${
                  selectedVersion === version ? 'nq-credit-toggle-active' : 'nq-credit-toggle-inactive'
                }`}
              >
                {version}
              </button>
            ))}
          </div>
        </header>

        <div className="nq-credit-frame mt-6 rounded-[28px] p-[clamp(8px,1.4vw,14px)] sm:mt-8">
          <div className="nq-credit-panel rounded-[22px] p-4 sm:p-6">
            <div className="nq-credit-list-badge mb-4 inline-flex rounded-full px-4 py-1 text-sm font-bold">
              List {selectedVersion}
            </div>

            {loading ? (
              <div className="py-12 text-center font-semibold text-[#4a2a1a]/70">Memuat tim...</div>
            ) : teamData[selectedVersion].length === 0 ? (
              <div className="py-12 text-center font-semibold text-[#4a2a1a]/70">Belum ada anggota tim {selectedVersion}.</div>
            ) : (
              <div className="space-y-8">
                {sectionGroups.map((group) => (
                  <div key={group.label}>
                    <h2 className={`nq-credit-section-label ${bauhaus.className} mb-3 text-lg tracking-wide text-[#4a2a1a] sm:text-xl`}>
                      {group.label}
                    </h2>
                    <div className="nq-credit-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                      {group.members.map((member) => (
                        <CreditMemberCard
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          name={member.name}
                          role={member.role}
                          photoURL={member.photoURL}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedMember && (
        <CreditMemberModal
          version={selectedVersion}
          memberName={selectedMember.name}
          memberRole={selectedMember.role}
          memberBio={selectedMember.bio}
          memberPhotoURL={selectedMember.photoURL}
          memberSection={selectedMemberSectionName}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </main>
  );
}
