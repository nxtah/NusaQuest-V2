'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { uploadProfilePhoto } from '../../../services/firebase/storage/profile-photo.service';
import { useUserProfile } from '../../../hooks/firebase/useUserProfile';

export default function Page() {
  const [uid, setUid] = useState('demo-user');
  const [displayName, setDisplayName] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const { profile, loading, error, saveDisplayName, refreshProfile } = useUserProfile(uid);

  const onSaveDisplayName = async () => {
    const success = await saveDisplayName(displayName);
    setUploadMessage(success ? 'Display name updated.' : 'Failed to update display name.');
  };

  const onUploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const result = await uploadProfilePhoto(uid, file);
    if (result.success) {
      setUploadMessage(`Photo uploaded: ${result.data.url}`);
    } else {
      setUploadMessage(`Upload failed: ${result.error}`);
    }
  };

  return (
    <main>
      <h1>Profile</h1>
      <p>Example Firebase RTDB and Storage usage via service layer.</p>

      <label htmlFor="uid">UID</label>
      <input id="uid" value={uid} onChange={(event) => setUid(event.target.value)} />
      <button type="button" onClick={() => void refreshProfile()}>
        Reload Profile
      </button>

      {loading && <p>Loading profile...</p>}
      {error && <p>Error: {error}</p>}

      <pre>{JSON.stringify(profile, null, 2)}</pre>

      <label htmlFor="display-name">Display Name</label>
      <input
        id="display-name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="New display name"
      />
      <button type="button" onClick={() => void onSaveDisplayName()}>
        Save Display Name
      </button>

      <label htmlFor="profile-photo">Upload Photo</label>
      <input id="profile-photo" type="file" accept="image/*" onChange={onUploadPhoto} />

      {uploadMessage && <p>{uploadMessage}</p>}
    </main>
  );
}
