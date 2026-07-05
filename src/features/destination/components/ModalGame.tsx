'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {subscribeToGames, type Game} from '@/src/features/destination/services/game.service';

interface ModalGameProps {
  show: boolean;
  onHide: () => void;
  selectedTopic: string | null;
}

export default function ModalGame({show, onHide, selectedTopic}: ModalGameProps) {
  const router = useRouter();
  const [games, setGames] = useState<Record<string, Game>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToGames((fetchedGames) => {
      setGames(fetchedGames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGameSelection = (gameId: string) => {
    if (!selectedTopic) return;
    router.push(`/lobby/${selectedTopic}/${gameId}`);
    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4>Pilih Permainan</h4>
          <button className="btn-close" onClick={onHide} />
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="text-center py-4">Loading games...</div>
          ) : Object.keys(games).length === 0 ? (
            <div className="text-center py-4">No games available</div>
          ) : (
            <div className="games-grid">
              {Object.entries(games).map(([gameId, game]) => (
                <div
                  key={gameId}
                  className="game-card"
                  onClick={() => handleGameSelection(gameId)}
                >
                  {game.image && <img src={game.image} alt={game.name} />}
                  <h5>{game.name}</h5>
                  {game.description && <p>{game.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
