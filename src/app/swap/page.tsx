"use client";

import { SwapCard } from "@/components/swap/swap-card";
import { RouteDetails } from "@/components/swap/route-details";
import { useState } from "react";

export default function SwapPage() {
  const [quote, setQuote] = useState<any>(null);

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <SwapCard onQuoteUpdate={setQuote} />
      <RouteDetails quote={quote} />
    </div>
  );
}
