import type { Item } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const { user } = useAuth();
  const timestamp = item.timestamp?.toDate ? item.timestamp.toDate() : new Date();

  // Create a deterministic chat ID from the two user emails and the item ID
  const getChatId = () => {
    if (!user) return null;
    const emails = [user.email!, item.userEmail].sort();
    return `${emails[0]}-${emails[1]}-${item.id}`;
  };

  const chatId = getChatId();

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {item.imageUrl && (
        <div className="relative w-full h-48">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            data-ai-hint="product photo"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
          <Badge
            variant={item.status === 'lost' ? 'destructive' : 'default'}
            className={cn(
              "capitalize",
              item.status === 'found' && 'bg-green-600 text-white'
            )}
          >
            {item.status}
          </Badge>
        </div>
        <CardDescription>
          In <Badge variant="secondary">{item.category}</Badge> at{' '}
          <span className="font-semibold text-foreground">{item.location}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
      <CardFooter className="bg-muted/50 p-3 text-xs text-muted-foreground flex justify-between items-center">
        <div className="flex flex-col">
          <span>Reported by {item.userName || item.userEmail}</span>
          <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
        </div>
        {user && user.email !== item.userEmail && chatId && (
          <Link href={`/chat/${chatId}?itemTitle=${encodeURIComponent(item.title)}&itemId=${item.id}&reporterEmail=${item.userEmail}`}>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Reporter
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
