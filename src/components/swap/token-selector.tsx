'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ARBITRUM_TOKENS, Token } from "@/lib/tokens";
import Image from "next/image";

interface TokenSelectorProps {
  children: React.ReactNode;
  onSelect: (token: Token) => void;
}

export function TokenSelector({ children, onSelect }: TokenSelectorProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {ARBITRUM_TOKENS.map((token) => (
            <Button
              key={token.symbol}
              variant="outline"
              className="flex items-center justify-start gap-4 p-2 h-auto"
              onClick={() => onSelect(token)}
            >
              <Image
                src={token.logoURI}
                alt={token.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="flex flex-col items-start">
                <span className="font-bold">{token.symbol}</span>
                <span className="text-xs text-muted-foreground">
                  {token.name}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
