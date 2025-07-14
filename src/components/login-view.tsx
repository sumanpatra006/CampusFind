'use client';

import { useAuth } from '@/providers/auth-provider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogIn, PackageSearch } from 'lucide-react';

export default function LoginView() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
            <PackageSearch className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to CampusFind</CardTitle>
          <CardDescription>Sign in to report or find lost items.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={signInWithGoogle}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
