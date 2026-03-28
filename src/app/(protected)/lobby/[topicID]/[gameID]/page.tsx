import RoomSelect from '../../../../../features/lobby/components/RoomSelect';

export default async function LobbyPage({ 
  params 
}: { 
  params: Promise<{ topicID: string; gameID: string }> 
}) {
  const resolvedParams = await params;

  return (
    <RoomSelect 
      topicID={resolvedParams.topicID} 
      gameID={resolvedParams.gameID} 
    />
  );
}