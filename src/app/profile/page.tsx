'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { background } from '@/src/assets/images/background/cloudinaryAssets';
import { information } from '@/src/assets/images/information/cloudinaryAssets';
import { ROUTES } from '@/src/lib/constants/routes';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import BackButton from '@/src/components/ui/BackButton';
import AchievementSection from '@/src/components/profile/AchievementSection';
import AttributeSection from '@/src/components/profile/AttributeSection';
import BadgeSection from '@/src/components/profile/BadgeSection';
import ProfileCard from '@/src/components/profile/ProfileCard';
import ProfileHeader from '@/src/components/profile/ProfileHeader';
import ProfilePanel from '@/src/components/profile/ProfilePanel';
import './profile.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const avatarSrc = user?.firebasePhotoURL || user?.googlePhotoURL || information.kertas;
  const username  = user?.displayName ?? 'Nusa Player';
  const email     = user?.email ?? '';

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.public.home);
  };

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

      <div className="profile-ui-layer">
        <div style={{ position: 'absolute', top: '2rem', left: '3rem', zIndex: 50, pointerEvents: 'auto' }}>
          <BackButton href={ROUTES.public.home} />
        </div>
        <div className="profile-main-layout">

          <div className="profile-left-region">
            <ProfileCard
              username={username}
              email={email}
              avatarSrc={avatarSrc}
              woodSrc={background.kayu}
              onLogout={handleLogout}
            />
          </div>

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
