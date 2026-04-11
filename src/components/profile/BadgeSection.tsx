import Image from 'next/image';

import { badge, type BadgeImageKey } from '@/src/assets/images/badge/cloudinaryAssets';

const featuredBadges: BadgeImageKey[] = ['bronze3', 'silver3', 'gold3'];

export default function BadgeSection() {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title poppins-bold">Badge</h3>
      <div className="badge-row">
        {featuredBadges.map((key) => (
          <span className="badge-icon" key={key}>
            <Image src={badge[key]} alt={`Badge ${key}`} fill className="badge-icon-image" sizes="80px" />
          </span>
        ))}
      </div>
    </section>
  );
}