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
