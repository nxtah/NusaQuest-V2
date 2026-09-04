import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limitToLast,
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
  // `limitToLast` (bukan `limit`) — kalau chat udah lewat `maxMessages`
  // pesan, `limit` + `orderBy asc` bakal ngunci di 50 pesan PALING LAMA
  // selamanya (pesan baru gak akan pernah ke-load lagi karena kalah "asc"
  // sama yang lama). `limitToLast` ngambil N TERBARU, tetep dalam urutan
  // lama->baru buat langsung dirender tanpa perlu di-reverse.
  const q = query(
    chatCollectionRef(roomId),
    orderBy('createdAt', 'asc'),
    limitToLast(maxMessages),
  );
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as ChatMessage));
    callback(messages);
  });
}
