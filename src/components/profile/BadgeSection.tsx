import Image from 'next/image';

import { badge, type BadgeImageKey } from '@/src/assets/images/badge/cloudinaryAssets';

interface BadgeSectionProps {
  badges?: { gold: number; silver: number; bronze: number };
}

const BADGE_TIERS: { key: 'bronze' | 'silver' | 'gold'; icon: BadgeImageKey; label: string }[] = [
  { key: 'bronze', icon: 'bronze1', label: 'Perunggu' },
  { key: 'silver', icon: 'silver1', label: 'Perak' },
  { key: 'gold', icon: 'gold1', label: 'Emas' },
];

export default function BadgeSection({ badges = { gold: 0, silver: 0, bronze: 0 } }: BadgeSectionProps) {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title poppins-bold">Badge</h3>
      <div className="badge-row">
        {BADGE_TIERS.map(({ key, icon, label }) => {
          const count = badges[key];
          return (
            <span className="badge-icon" key={key} style={{ position: 'relative', opacity: count > 0 ? 1 : 0.35 }}>
              <Image src={badge[icon]} alt={`Badge ${label}`} fill className="badge-icon-image" sizes="80px" />
              <span
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  minWidth: 20,
                  height: 20,
                  borderRadius: 999,
                  background: '#4a2a1a',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {count}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}