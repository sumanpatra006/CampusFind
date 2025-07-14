import type { Timestamp } from 'firebase/firestore';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'lost' | 'found';
  location: string;
  imageUrl?: string;
  userEmail: string;
  userName?: string;
  timestamp: Timestamp;
}

export interface Chat {
    id: string;
    participants: string[];
    itemTitle: string;
    itemId: string;
    lastMessage?: string;
    lastMessageTimestamp?: Timestamp;
    lastMessageSender?: string;
    seenBy: string[];
}

export interface Message {
    id: string;
    chatId: string;
    senderEmail: string;
    text: string;
    timestamp: Timestamp;
}
