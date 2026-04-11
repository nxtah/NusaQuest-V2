import Image from 'next/image';
import { ReactNode } from 'react';

type ProfilePanelProps = {
  woodSrc: string;
  title: string;
  children: ReactNode;
};

export default function ProfilePanel({ woodSrc, title, children }: ProfilePanelProps) {
  return (
    <section className="profile-panel">
      <div className="profile-panel-bg">
        <Image src={woodSrc} alt="Background panel kayu" fill className="profile-image" />
      </div>

      <div className="profile-panel-shell">
        <div className="profile-panel-content">{children}</div>
      </div>
    </section>
  );
}