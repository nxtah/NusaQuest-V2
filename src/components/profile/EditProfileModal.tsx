'use client';

import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

type EditProfileModalProps = {
  onClose: () => void;
  initialUsername?: string;
  avatarSrc?: string;
};

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4.5h6l1.2 2H20a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h3.8L9 4.5z" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 3h11l3 3v15H5V3z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 3v6h8V3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function EditProfileModal({
  onClose,
  initialUsername = 'Nusa Player',
  avatarSrc,
}: EditProfileModalProps) {
  const [username, setUsername] = useState(initialUsername);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (selectedPhotoUrl) {
        URL.revokeObjectURL(selectedPhotoUrl);
      }
    };
  }, [selectedPhotoUrl]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    if (selectedPhotoUrl) {
      URL.revokeObjectURL(selectedPhotoUrl);
    }
    setSelectedPhotoUrl(nextUrl);
  };

  const previewSrc = selectedPhotoUrl ?? avatarSrc;

  return (
    <div
      className="epm-overlay"
      onMouseDown={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
    >
      <div className="epm-panel">
        <div className="epm-close-row">
          <button type="button" className="epm-close-btn" onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        <div className="epm-content">
          <div className="epm-avatar-wrap">
            <div className="epm-avatar">
              {previewSrc ? (
                <Image src={previewSrc} alt="Profile photo" fill className="object-cover" unoptimized />
              ) : null}
            </div>

            <button
              type="button"
              className="epm-change-photo-btn"
              onClick={() => photoInputRef.current?.click()}
            >
              <CameraIcon />
              Change Photo
            </button>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="epm-hidden-input"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="epm-field">
            <label htmlFor="edit-username" className="epm-label">Username</label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="epm-input"
            />
          </div>

          <div className="epm-actions">
            <button type="button" className="epm-save-btn" onClick={onClose}>
              <SaveIcon />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
