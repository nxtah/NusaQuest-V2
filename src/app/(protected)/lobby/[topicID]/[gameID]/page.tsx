'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { useRoomSync } from '../../../../../hooks/firebase/useRoomSync';

type LobbyPageParams = {
  topicID: string;
  gameID: string;
};

export default function Page() {
  const params = useParams<LobbyPageParams>();
  const [roomId, setRoomId] = useState('room-1');
  const { room, loading, error } = useRoomSync(params.topicID, params.gameID, roomId);

  return (
    <main>
      <h1>Lobby</h1>
      <p>Example realtime room sync via Firebase service layer.</p>

      <label htmlFor="room-id">Room ID</label>
      <input
        id="room-id"
        value={roomId}
        onChange={(event) => setRoomId(event.target.value)}
        placeholder="room-1"
      />

      {loading && <p>Loading room data...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && <pre>{JSON.stringify(room, null, 2)}</pre>}
    </main>
  );
}
