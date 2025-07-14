'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/providers/auth-provider';
import type { Chat } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    };

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.email),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Chat));
      setChats(chatsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
              <MessageSquareText className="mr-2 h-6 w-6" /> My Chats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || authLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : chats.length > 0 ? (
              <div className="space-y-2">
                {chats.map(chat => {
                  const otherUserEmail = chat.participants.find(p => p !== user?.email);
                  const lastMessageDate = chat.lastMessageTimestamp?.toDate ? formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true }) : '';
                  const isUnread = chat.seenBy && !chat.seenBy.includes(user?.email || '');

                  return (
                    <Link href={`/chat/${chat.id}`} key={chat.id}>
                      <div className="block p-4 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>{otherUserEmail?.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                <p className="font-semibold">{chat.itemTitle}</p>
                                <p className={cn("text-sm text-muted-foreground truncate max-w-md", isUnread && "font-bold text-foreground")}>
                                    {chat.lastMessageSender === user?.email && 'You: '}
                                    {chat.lastMessage || 'No messages yet.'}
                                </p>
                                </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground flex flex-col items-end gap-2">
                                <span>{lastMessageDate}</span>
                                {isUnread && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
                            </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-10">You have no active chats.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
