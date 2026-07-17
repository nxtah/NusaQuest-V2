import {firebaseStorage} from '@/src/lib/firebase/client';
import {ref as storageRef, uploadBytes, getDownloadURL, deleteObject} from 'firebase/storage';

export type {ChatMessage} from '@/src/services/firebase/firestore/chat.service';
export {sendChatMessage, subscribeRoomChat} from '@/src/services/firebase/firestore/chat.service';

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
