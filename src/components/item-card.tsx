import type { Item } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const
 
timestamp = item.timestamp?.toDate ? item.timestamp.toDate() : new Date();

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
      <CardFooter className="bg-muted/50 p-4 text-xs text-muted-foreground flex justify-between">
        <span>Reported by {item.userName || item.userEmail}</span>
        <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
      </CardFooter>
    </Card>
  );
}
