import {firebaseDb, firebaseStorage} from '@/src/lib/firebase/client';
import {ref, get, set, update, remove} from 'firebase/database';
import {ref as storageRef, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

const ROOMS_PATH = 'rooms';
const CHAT_PATH = 'chat';

export async function sendChatMessage(
  topicID: string,
  gameID: string,
  roomID: string,
  userId: string,
  userName: string,
  message: string,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const chatPath = `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${CHAT_PATH}/${Date.now()}`;
    await set(ref(firebaseDb, chatPath), {
      userId,
      userName,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export function subscribeRoomChat(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  if (!firebaseDb) {
    callback([]);
    return () => { };
  }

  try {
    const chatRef = ref(
      firebaseDb,
      `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/${CHAT_PATH}`,
    );
    return onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messages = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          ...msg,
        }));
        callback(messages);
      } else {
        callback([]);
      }
    });
  } catch {
    callback([]);
    return () => { };
  }
}

export async function uploadProfilePhoto(
  userId: string,
  file: File,
): Promise<string> {
  if (!firebaseStorage) throw new Error('Storage not initialized');

  try {
    const fileName = `${Date.now()}_${file.name}`;
    const photoRef = storageRef(firebaseStorage, `profilePhotos/${userId}/${fileName}`);

    await uploadBytes(photoRef, file);
    const downloadURL = await getDownloadURL(photoRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

export async function deleteProfilePhoto(photoPath: string): Promise<void> {
  if (!firebaseStorage) return;

  try {
    if (photoPath) {
      const photoRef = storageRef(firebaseStorage, photoPath);
      await deleteObject(photoRef);
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
  }
}

// Import onValue for chat subscription
import {onValue} from 'firebase/database';
