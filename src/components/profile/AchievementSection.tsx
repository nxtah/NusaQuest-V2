import Image from 'next/image';

import { achievements, type AchievementsImageKey } from '@/src/assets/images/badge/cloudinaryAssets';
import type { UserAchievements } from '@/src/types/auth';

interface AchievementSectionProps {
  achievements?: UserAchievements;
}

const ACHIEVEMENT_ITEMS: {id: keyof UserAchievements; text: string}[] = [
  {
    id: 'speedRun',
    text: 'Memenangkan permainan dalam kurang dari 10 menit',
  },
  {
    id: 'streak',
    text: 'Menang berturut-turut dalam tiga pertandingan',
  },
];

const achievementIconKey: AchievementsImageKey = 'achievements1';

export default function AchievementSection({
  achievements: userAchievements = {speedRun: false, streak: false},
}: AchievementSectionProps) {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title poppins-bold">Achievement</h3>
      <div className="achievement-grid">
        {ACHIEVEMENT_ITEMS.map((item) => {
          const unlocked = userAchievements[item.id];
          return (
            <article className="achievement-card" key={item.id} style={{opacity: unlocked ? 1 : 0.4}}>
              <span className="achievement-icon">
                <Image src={achievements[achievementIconKey]} alt="Achievement badge" fill className="achievement-icon-image" sizes="80px" />
              </span>
              <p className="achievement-text">{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
