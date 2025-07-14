'use client';

import { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ChatRoomProps {
  chatId: string;
  currentUserEmail: string;
  itemTitle?: string | null;
  itemId?: string | null;
  reporterEmail?: string | null;
}

export default function ChatRoom({ 
  chatId, 
  currentUserEmail, 
  itemTitle: newItemTitle,
  itemId: newItemId,
  reporterEmail: newReporterEmail,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatExists, setChatExists] = useState(true);
  const [itemTitle, setItemTitle] = useState(newItemTitle);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatDocRef = doc(db, 'chats', chatId);

    const checkAndCreateChat = async () => {
        const docSnap = await getDoc(chatDocRef);
        if (!docSnap.exists()) {
            if (newItemId && newItemTitle && newReporterEmail) {
                // Create the chat document
                await setDoc(chatDocRef, {
                    participants: [currentUserEmail, newReporterEmail],
                    itemId: newItemId,
                    itemTitle: newItemTitle,
                    createdAt: serverTimestamp(),
                    lastMessage: 'Chat started.',
                    lastMessageTimestamp: serverTimestamp(),
                    lastMessageSender: currentUserEmail,
                });
                setChatExists(true);
            } else {
                setChatExists(false);
            }
        } else {
            const chatData = docSnap.data();
            if (!itemTitle) {
                setItemTitle(chatData.itemTitle);
            }
        }
    };

    checkAndCreateChat();

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [chatId, currentUserEmail, newItemId, newItemTitle, newReporterEmail, itemTitle]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      // Add new message
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderEmail: currentUserEmail,
        text: newMessage,
        timestamp: serverTimestamp(),
      });

      // Update the last message on the chat document
      const chatDocRef = doc(db, 'chats', chatId);
      await setDoc(chatDocRef, {
        lastMessage: newMessage,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSender: currentUserEmail,
      }, { merge: true });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not send message.',
      });
    }
  };

  if (!chatExists) {
      return <div className="text-center p-8">Chat not found or you do not have permission to view it.</div>
  }

  return (
    <Card className="h-full flex flex-col border-0 md:border rounded-none md:rounded-lg">
      <CardHeader className="border-b flex-shrink-0">
        <div className="flex items-center gap-4">
            <Link href="/chats">
                <Button variant="ghost" size="icon" className="md:hidden">
                    <ArrowLeft />
                </Button>
            </Link>
            <CardTitle className="font-headline text-xl">{itemTitle || 'Chat'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-end gap-2',
              message.senderEmail === currentUserEmail ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'p-3 rounded-lg max-w-xs md:max-w-md',
                message.senderEmail === currentUserEmail
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              <p>{message.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter className="border-t pt-6 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
