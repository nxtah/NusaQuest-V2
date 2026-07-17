import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  type Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';

export interface ChatMessage {
  id?: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Timestamp | number;
}

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

function chatCollectionRef(roomId: string) {
  return collection(requireFirestore(), 'rooms', roomId, 'chat');
}

export async function sendChatMessage(
  roomId: string,
  userId: string,
  userName: string,
  message: string,
): Promise<string> {
  const ref = chatCollectionRef(roomId);
  const docRef = await addDoc(ref, {
    userId,
    userName,
    message,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeRoomChat(
  roomId: string,
  callback: (messages: ChatMessage[]) => void,
  maxMessages: number = 50,
): () => void {
  const q = query(
    chatCollectionRef(roomId),
    orderBy('createdAt', 'asc'),
    limit(maxMessages),
  );
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as ChatMessage));
    callback(messages);
  });
}
