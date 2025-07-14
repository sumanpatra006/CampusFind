'use client';

import { useSearchParams } from 'next/navigation';
import Header from '@/components/header';
import ChatRoom from '@/components/chat-room';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { chatId } = params;
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  
  // These are passed when creating a new chat
  const itemTitle = searchParams.get('itemTitle');
  const itemId = searchParams.get('itemId');
  const reporterEmail = searchParams.get('reporterEmail');
  
  if (loading) {
      return (
          <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-grow container mx-auto p-4">
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-96 w-full" />
              </div>
          </div>
      )
  }

  if (!user) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow container mx-auto p-4 flex items-center justify-center">
               <p>Please log in to view your chats.</p>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-grow overflow-hidden">
        <ChatRoom 
            chatId={chatId} 
            currentUserEmail={user.email!}
            // Pass optional params for chat creation
            itemTitle={itemTitle}
            itemId={itemId}
            reporterEmail={reporterEmail}
        />
      </main>
    </div>
  );
}
