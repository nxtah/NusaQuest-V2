'use client';

import { useRouter } from 'next/navigation';
import { getRoomImage } from '../../../assets/images/room/cloudinaryAssets';
import { getBackgroundImage } from '../../../assets/images/background/cloudinaryAssets';
import { getAwanImage } from '../../../assets/images/hero/cloudinaryAssets';
import { getInformationImage } from '../../../assets/images/information/cloudinaryAssets';
import '../../../app/(protected)/lobby/[topicID]/[gameID]/lobby.css';

interface RoomSelectProps {
  topicID: string;
  gameID: string;
  onSelect?: (roomId: string | number) => void; 
}

export default function RoomSelect({ topicID, gameID, onSelect }: RoomSelectProps) {
  const router = useRouter();

  const houses = [
    { id: 4,       imgKey: 'room4',  l: '28%', r: 'auto', b: '42%', w: '20%', z: 15 },
    { id: 'vs-ai', imgKey: 'roomAi', l: 'auto', r: '28%', b: '42%', w: '21%', z: 15 },
    { id: 1,       imgKey: 'room1',  l: '12%', r: 'auto', b: '22%', w: '25%', z: 25 },
    { id: 3,       imgKey: 'room3',  l: 'auto', r: '12%', b: '20%', w: '25%', z: 25 },
    { id: 2,       imgKey: 'room2',  l: '41%', r: 'auto', b: '20%', w: '18%', z: 35 },
  ];

  return (
    <main className="lobby-container">
      <div className="diorama-wrapper">
        <img src={getBackgroundImage('langit')} className="bg-langit" alt="langit" />

        <img src={getAwanImage('awan2')} className="animate-cloud cloud-1" alt="c1" />
        <img src={getAwanImage('awan2')} className="animate-cloud cloud-2" alt="c2" />
    
        <img src={getBackgroundImage('land')} className="land-image" alt="land" />

        {houses.map((house) => (
          <button
            key={house.id}
            onClick={() => {
              if (onSelect) onSelect(house.id);
              router.push(`/room/${gameID}/${topicID}/room${house.id}`);
            }}
            className="rumah-button"
            style={{ 
              '--l': house.l, 
              '--r': house.r, 
              '--b': house.b, 
              '--w': house.w, 
              '--z': house.z 
            } as React.CSSProperties}
          >
            <img
              src={getRoomImage(house.imgKey as any)}
              className="rumah-img-content"
              alt={`room-${house.id}`}
            />
          </button>
        ))}

        <div className="ornament-layer">
          <img src={getInformationImage('tanaman1')} className="tanaman-kiri" alt="t1" />
          <img src={getInformationImage('tanaman1')} className="tanaman-kanan" alt="t2" />
          <img src={getInformationImage('melati')} className="melati-kiri" alt="m1" />
          <img src={getInformationImage('melati')} className="melati-kanan" alt="m2" />

          <div className="papan-hiasan">
            <img src={getInformationImage('board1')} className="board-img" alt="board" />
            <span className="font-irish text-board">Select Room</span>
          </div>
        </div>
      </div>

      <button onClick={() => router.back()} className="btn-back"> &lt; </button>
    </main>
  );
}