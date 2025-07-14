'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Item } from '@/lib/types';
import ItemCard from './item-card';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

type Filter = 'all' | 'lost' | 'found';

export default function ItemFeed() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    const itemsCollection = collection(db, 'items');
    let q;

    // Base query to filter out resolved items
    const baseQueryConstraints = [where('resolved', '!=', true), orderBy('timestamp', 'desc')];
    
    // Add status filter if not 'all'
    if (filter === 'all') {
      // The Firestore SDK doesn't allow inequality filters on one field and ordering on another without a composite index.
      // To keep it simple, we filter resolved items on the client for the 'all' view.
      // For specific filters ('lost'/'found'), we can do it in the query.
       q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
    } else {
       q = query(itemsCollection, where('status', '==', filter), where('resolved', '!=', true), orderBy('timestamp', 'desc'));
    }

    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Item));
      
      // Client-side filter for 'all' to remove resolved items
      if (filter === 'all') {
        itemsData = itemsData.filter(item => !item.resolved);
      }

      setItems(itemsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      // This might be a missing index error. Log it for the user.
      if (error.message.includes("requires an index")) {
        console.error("Firestore index missing. Please create the required composite index in your Firebase console.", error.message);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-2xl font-bold">Item Feed</h2>
        <div className="flex items-center gap-2 rounded-lg p-1 bg-muted">
          {(['all', 'lost', 'found'] as Filter[]).map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f)}
              className={cn(
                'capitalize transition-colors duration-200',
                filter === f ? 'bg-primary/80 hover:bg-primary text-primary-foreground' : 'hover:bg-background/50'
              )}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-lg" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold font-headline">No Items Found</h3>
          <p className="text-muted-foreground">There are no {filter !== 'all' ? filter : ''} items to display yet.</p>
        </div>
      )}
    </div>
  );
}
