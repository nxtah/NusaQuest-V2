import Image from 'next/image';

import { achievements, type AchievementsImageKey } from '@/src/assets/images/badge/cloudinaryAssets';

const achievementItems = [
  {
    id: 'speed-run',
    text: 'Memenangkan permainan dalam kurang dari 10 menit',
  },
  {
    id: 'streak',
    text: 'Menang berturut-turut dalam tiga pertandingan',
  },
];

const achievementIconKey: AchievementsImageKey = 'achievements1';

export default function AchievementSection() {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title poppins-bold">Achievement</h3>
      <div className="achievement-grid">
        {achievementItems.map((item) => (
          <article className="achievement-card" key={item.id}>
            <span className="achievement-icon">
              <Image src={achievements[achievementIconKey]} alt="Achievement badge" fill className="achievement-icon-image" sizes="80px" />
            </span>
            <p className="achievement-text">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}