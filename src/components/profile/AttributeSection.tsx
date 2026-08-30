import Image from 'next/image';

import { attribut, type AttributImageKey } from '@/src/assets/images/badge/cloudinaryAssets';

const attributeIconKey: AttributImageKey = 'potion1';

interface AttributeSectionProps {
  potionCount?: number;
}

export default function AttributeSection({ potionCount = 0 }: AttributeSectionProps) {
  return (
    <section className="profile-section">
      <h3 className="profile-section-title poppins-bold">Attribut</h3>
      <div className="attribute-row">
        <span className="attribute-icon">
          <Image src={attribut[attributeIconKey]} alt="Potion icon" fill className="attribute-icon-image" sizes="64px" />
        </span>
        <p className="attribute-count">{potionCount}x</p>
      </div>
    </section>
  );
}