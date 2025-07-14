'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FilePlus2, Search, BellRing, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-primary/10">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4">
            Lost something? Find it with CampusFind.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            The easiest way for students and faculty to report and find lost items on campus. Reclaim what's yours in just a few clicks.
          </p>
          <Button size="lg" onClick={signInWithGoogle}>
            Get Started <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-headline">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
                  <FilePlus2 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline">Report an Item</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Quickly post details and a photo of a lost or found item. Our smart system helps categorize it for better visibility.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline">Search the Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Browse a live feed of all reported items on campus. Filter by 'lost' or 'found' to narrow your search.</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
                  <BellRing className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="font-headline">Get Notified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Connect with the person who found your item or reported it lost. We facilitate a safe and easy reunion.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Image and CTA section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <Image 
                    src="https://placehold.co/600x400.png" 
                    alt="Campus life with students" 
                    fill
                    className="object-cover"
                    data-ai-hint="college campus students"
                />
            </div>
            <div>
                <h2 className="text-3xl font-bold font-headline mb-4">Join Your Campus Community</h2>
                <p className="text-muted-foreground mb-6">
                    Hundreds of items get misplaced on campus every day. CampusFind brings everyone together to help each other out. A more connected campus is a better campus.
                </p>
                <Button size="lg" onClick={signInWithGoogle}>Sign In and Start Finding</Button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-background border-t">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} CampusFind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
