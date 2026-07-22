"use client";

import Image from 'next/image';
import { useState } from 'react';


import EditProfileModal from './EditProfileModal';

type ProfileCardProps = {
  username: string;
  email: string;
  avatarSrc: string;
  woodSrc: string;
  onLogout: () => void;
};

export default function ProfileCard({ username, email, avatarSrc, woodSrc, onLogout }: ProfileCardProps) {
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  // const [isLoggingOut] = useState(false);

  return (
    <>
      <section className="profile-card">
        <div className="profile-card-bg">
          <Image src={woodSrc} alt="Background kayu" fill className="profile-image" />
        </div>

        <div className="profile-card-shell">
          <div className="profile-card-content">
            <div className="profile-avatar-wrap">
              <Image
                src={avatarSrc}
                alt="Avatar pengguna"
                fill
                className="profile-image"
                unoptimized={avatarSrc.startsWith('blob:')}
              />
            </div>

            <div className="profile-card-info">
              <h2 className="profile-name poppins-bold">{username}</h2>
              <p className="profile-email poppins-bold">{email}</p>
            </div>

            <div className="profile-card-actions">
              <button
                type="button"
                id="btn-edit-profile"
                className="profile-action-btn edit poppins-bold"
                onClick={() => setIsEditOpen(true)}
              >
                Edit Profile
              </button>
              <button
                type="button"
                id="btn-logout"
                className="profile-action-btn logout poppins-bold"
                onClick={onLogout}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </section>

      {isEditOpen && (
        <EditProfileModal
          onClose={() => setIsEditOpen(false)}
          initialUsername={username}
          avatarSrc={avatarSrc}
        />
      )}
    </>
  );
}