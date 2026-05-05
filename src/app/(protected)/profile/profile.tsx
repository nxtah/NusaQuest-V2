'use client';

import Image from 'next/image';

import { background } from '../../../assets/images/background/cloudinaryAssets';
import { information } from '../../../assets/images/information/cloudinaryAssets';
import AchievementSection from '../../../components/profile/AchievementSection';
import AttributeSection from '../../../components/profile/AttributeSection';
import BadgeSection from '../../../components/profile/BadgeSection';
import ProfileCard from '../../../components/profile/ProfileCard';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import ProfilePanel from '../../../components/profile/ProfilePanel';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();

  // Ambil foto profil: utamakan foto yang di-upload ke Firebase Storage,
  // jika belum ada pakai foto Google, fallback ke gambar kertas
  const avatarSrc =
    user?.firebasePhotoURL ||
    user?.googlePhotoURL ||
    information.kertas;

  const username  = user?.displayName || 'Nusa Player';
  const email     = user?.email        || '';

  return (
    <div className="profile-scene">
      <div className="profile-bg-layer">
        <Image
          src={background.laut}
          alt="Laut"
          fill
          sizes="100vw"
          className="profile-image"
          priority
        />
      </div>

      {/* Daratan bawah */}
      <div className="profile-land-layer">
        <Image
          src={background.landprofile}
          alt="Land"
          fill
          sizes="100vw"
          className="profile-image"
          priority
        />
      </div>

      {/* UI Layer */}
      <div className="profile-ui-layer">
        <div className="profile-main-layout">

          {/* Kolom kiri: kartu profil */}
          <div className="profile-left-region">
            <ProfileCard
              username={username}
              email={email}
              avatarSrc={avatarSrc}
              woodSrc={background.kayu}
            />
          </div>

          {/* Kolom kanan: header dekorasi + panel konten */}
          <div className="profile-right-region">
            <ProfileHeader
              boardSrc={information.board1}
              branchLeftSrc={information.tanamankiri}
              branchRightSrc={information.tanamankanan}
              plantSrc={information.tanaman2}
              title="Profile"
            />
            <ProfilePanel woodSrc={background.kayu} title="Profile">
              <BadgeSection />
              <AttributeSection />
              <AchievementSection />
            </ProfilePanel>
          </div>

        </div>
      </div>
    </div>
  );
}