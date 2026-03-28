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
      <div className="profile-header-branch profile-header-branch-left">
        <Image src={branchLeftSrc} alt="Dekorasi kiri" fill className="profile-image" />
      </div>

      <div className="profile-header-branch profile-header-branch-right">
        <Image src={branchRightSrc} alt="Dekorasi kanan" fill className="profile-image" />
      </div>

      <div className="profile-header-board">
        <Image src={boardSrc} alt="Papan judul" fill className="profile-image" />
      </div>

      <h1 className="profile-header-title">{title}</h1>
    </div>
  );
}