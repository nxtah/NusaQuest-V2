import type { ChatMessage } from '../../../types/firebase.types';
import type { AppResult } from '../../../utils/result';

import { getData, pushData, roomChatPath, subscribeData } from './base.service';

export function getRoomMessages(roomId: string): Promise<AppResult<Record<string, ChatMessage> | null>> {
  return getData<Record<string, ChatMessage>>(roomChatPath(roomId));
}

export function sendRoomMessage(
  roomId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt'>,
): Promise<AppResult<{ id: string }>> {
  return pushData<Omit<ChatMessage, 'id'>>(roomChatPath(roomId), {
    ...message,
    createdAt: Date.now(),
  });
}

export function subscribeRoomMessages(
  roomId: string,
  onChange: (messages: Record<string, ChatMessage> | null) => void,
  onError?: (message: string) => void,
) {
  return subscribeData<Record<string, ChatMessage>>(roomChatPath(roomId), onChange, onError);
}
