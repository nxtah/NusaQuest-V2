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

  // Realtime — dulu data tim hardcode di file ini, sekarang dikelola dari
  // admin panel (tab Credit) dan langsung kelihatan di sini begitu berubah.
  useEffect(() => {
    const unsub = listenToCreditMembers((members) => {
      setTeamData(groupCreditMembersByTeam(members));
      setLoading(false);
    });
    return () => unsub();
  }, []);

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
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6 lg:left-12 lg:top-12">
          <BackButton href="/home" />
        </div>

        <header className="text-center text-white">
          <h1 className={`${bauhaus.className} text-3xl tracking-normal sm:text-4xl lg:text-5xl`}>
            Tim NusaQuest
          </h1>

          <div className="mt-6 flex justify-center gap-3">
            {(['V1', 'V2'] as const).map((version) => (
              <button
                key={version}
                type="button"
                onClick={() => setSelectedVersion(version)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition sm:text-base ${
                  selectedVersion === version
                    ? 'bg-yellow-300 text-green-900'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {version}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-6 rounded-2xl border border-green-300/40 bg-green-900/20 p-4 backdrop-blur-sm sm:mt-8 sm:p-6">
          <div className="mb-4 inline-flex rounded-full bg-green-500 px-4 py-1 text-sm font-semibold text-white">
            List {selectedVersion}
          </div>

          {loading ? (
            <div className="py-12 text-center text-white/80">Memuat tim...</div>
          ) : teamData[selectedVersion].length === 0 ? (
            <div className="py-12 text-center text-white/80">Belum ada anggota tim {selectedVersion}.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {teamData[selectedVersion].map((member) => (
                <CreditMemberCard
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  name={member.name}
                  role={member.role}
                  photoURL={member.photoURL}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedMember && (
        <CreditMemberModal
          version={selectedVersion}
          memberName={selectedMember.name}
          memberRole={selectedMember.role}
          memberBio={selectedMember.bio}
          memberPhotoURL={selectedMember.photoURL}
          titleClassName={bauhaus.className}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </main>
  );
}
