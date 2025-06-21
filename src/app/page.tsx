import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert mx-auto"
          src="/icon.png"
          alt="GainTrack Logo"
          width={180}
          height={38}
          priority
        />

        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Track your gains — with GainTrack
          </h1>
          <p className="text-xl text-muted-foreground">
            GainTrack is a tool that helps you track your gains.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/dashboard">
              Start tracking your gains
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
