import Image from 'next/image';

type ProfileCardProps = {
  username: string;
  email: string;
  avatarSrc: string;
  woodSrc: string;
};

export default function ProfileCard({ username, email, avatarSrc, woodSrc }: ProfileCardProps) {
  return (
    <section className="profile-card">
      <div className="profile-card-bg">
        <Image src={woodSrc} alt="Background kayu" fill className="profile-image" />
      </div>

      <div className="profile-card-shell">
        <div className="profile-card-content">
          <div className="profile-avatar-wrap">
            <Image src={avatarSrc} alt="Avatar pengguna" fill className="profile-image" />
          </div>

          <h2 className="profile-name">{username}</h2>
          <p className="profile-email">{email}</p>

          <div className="profile-card-actions">
            <button type="button" className="profile-action-btn edit">
              Edit Profile
            </button>
            <button type="button" className="profile-action-btn logout">
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}