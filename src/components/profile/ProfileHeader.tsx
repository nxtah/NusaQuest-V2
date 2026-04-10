import Image from 'next/image';

type ProfileHeaderProps = {
  boardSrc: string;
  branchLeftSrc: string;
  branchRightSrc: string;
  plantSrc: string;
  title: string;
};

export default function ProfileHeader({
  boardSrc,
  branchLeftSrc,
  branchRightSrc,
  title,
}: ProfileHeaderProps) {
  return (
    <div className="profile-header-wrapper">
      {/* Tanaman kiri — keluar ke kiri dari board */}
      <div className="profile-header-branch profile-header-branch-left">
        <Image
          src={branchLeftSrc}
          alt="Dekorasi kiri"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Tanaman kanan — keluar ke kanan dari board */}
      <div className="profile-header-branch profile-header-branch-right">
        <Image
          src={branchRightSrc}
          alt="Dekorasi kanan"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Papan judul */}
      <div className="profile-header-board">
        <Image
          src={boardSrc}
          alt="Papan judul"
          fill
          style={{ objectFit: 'fill' }}
        />
      </div>

      {/* Judul di tengah board */}
      <h1 className="profile-header-title profiletitle">{title}</h1>
    </div>
  );
}