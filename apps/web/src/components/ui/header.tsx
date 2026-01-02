'use client';

import Link from "next/link";
import { Button } from "./button";
import { useTheme } from "next-themes";
import { useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  const { setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  return (
    <header className='flex items-center py-7 px-9 bg-muted border-b border-border justify-between'>
      <Button 
        onClick={() => {
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          setCurrentTheme(newTheme);
          setTheme(newTheme);
        }}>Change Theme</Button>
      <div className='flex gap-4'>
        <SignedOut>
          <Button>
            <Link href={'/sign-in'}>Sign In</Link>
          </Button>
          <Button >
            <Link href={'/sign-up'}>Sign Up</Link>
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}