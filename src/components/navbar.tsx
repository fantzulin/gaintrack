"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b relative">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden pl-0 bg-transparent"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </Button>
        <Link href="/" className="text-xl font-bold [text-decoration:none]">
          GainTrack
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard" className="[text-decoration:none]">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/swap" className="[text-decoration:none]">Swap</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/defi" className="[text-decoration:none]">DeFi</Link>
            </Button>
          </div>
          <ConnectButton />
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" asChild className="justify-start">
                <Link 
                  href="/dashboard" 
                  className="[text-decoration:none]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild className="justify-start">
                <Link 
                  href="/swap" 
                  className="[text-decoration:none]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Swap
                </Link>
              </Button>
              <Button variant="ghost" asChild className="justify-start">
                <Link 
                  href="/defi" 
                  className="[text-decoration:none]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  DeFi
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 