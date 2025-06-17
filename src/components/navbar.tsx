"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold [text-decoration:none]">
          GainTrack
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard" className="[text-decoration:none]">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/defi" className="[text-decoration:none]">DeFi</Link>
          </Button>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
} 