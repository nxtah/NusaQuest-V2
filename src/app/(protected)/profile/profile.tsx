import Image from 'next/image';

import { background } from '../../../assets/images/background/cloudinaryAssets';
import { information } from '../../../assets/images/information/cloudinaryAssets';
import AchievementSection from '../../../components/profile/AchievementSection';
import AttributeSection from '../../../components/profile/AttributeSection';
import BadgeSection from '../../../components/profile/BadgeSection';
import ProfileCard from '../../../components/profile/ProfileCard';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import ProfilePanel from '../../../components/profile/ProfilePanel';

export default function Profile() {
  return (
    <div className="profile-scene relative w-full h-screen overflow-hidden">
      <div className="profile-bg-layer">
        <Image src={background.laut} alt="Laut" fill className="profile-image" priority />
      </div>

      <div className="profile-land-layer">
        <Image src={background.landprofile} alt="Land" fill className="profile-image" priority />
      </div>

      <div className="profile-ui-layer">
        <div className="profile-main-layout flex items-stretch justify-between">
          <div className="profile-left-region">
            <ProfileCard
              username="Nusa Player"
              email="nusa.player@mail.com"
              avatarSrc={information.imagePopup}
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