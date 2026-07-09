'use client';

import Image from 'next/image';
import { background } from '../../assets/images/background/cloudinaryAssets';
import { information } from '../../assets/images/information/cloudinaryAssets';
import BackButton from '../../components/ui/BackButton';
import AchievementSection from '../../components/profile/AchievementSection';
import AttributeSection from '../../components/profile/AttributeSection';
import BadgeSection from '../../components/profile/BadgeSection';
import ProfileCard from '../../components/profile/ProfileCard';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePanel from '../../components/profile/ProfilePanel';
import './profile.css';

export default function ProfilePage() {
  const avatarSrc = information.kertas;
  const username  = 'Nusa Player';
  const email     = 'player@nusaquest.com';

  return (
    <div className="profile-scene">
      <div className="profile-bg-layer">
        <Image
          src={background.langit}
          alt="Langit"
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
          <BackButton href="/home" />
        </div>
        <div className="profile-main-layout">

          <div className="profile-left-region">
            <ProfileCard
              username={username}
              email={email}
              avatarSrc={avatarSrc}
              woodSrc={background.kayu}
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
