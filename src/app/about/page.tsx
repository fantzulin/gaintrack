"use client";

import { useEffect, useState } from "react";

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div
        className={`mx-auto max-w-3xl transform transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <h1 className="text-2xl font-semibold mb-3">About</h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Project Overview</h2>
          <p className="text-gray-600 leading-relaxed">
            GainTrack is a DeFi analytics dashboard that helps users track portfolio performance and
            yield strategies across multiple protocols. It allows users to connect their wallets,
            monitor DeFi positions, and visualize performance data in a simple interface.
          </p>
        </section>

        <div className="border-t border-gray-200 my-6" />

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Tech Stack</h2>
          <p className="text-gray-600 leading-relaxed">
            Next.js, wagmi, RainbowKit, viem, DefiLlama API, Google Sheet API, Python, Node.js,
            Vitest, GitHub Actions.
          </p>
        </section>

        <div className="border-t border-gray-200 my-6" />

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Key Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
            <li>Multi-wallet integration with RainbowKit</li>
            <li>Automated data tracking using Google Sheets API</li>
            <li>Real-time DeFi protocol data via DefiLlama API</li>
            <li>Frontend testing pipeline with Vitest + GitHub Actions</li>
          </ul>
        </section>

        <div className="border-t border-gray-200 my-6" />

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Challenges & Solutions</h2>
          <p className="text-gray-600 leading-relaxed">
            Integrating multiple wallet sources caused inconsistent session states. Solved by
            customizing RainbowKit provider and standardizing wagmi configuration.
          </p>
        </section>

        <div className="border-t border-gray-200 my-6" />

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">My Role</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
            <li>Frontend architecture and UI development</li>
            <li>API integration and data synchronization</li>
            <li>Wallet connection and on-chain function handling</li>
            <li>Testing and deployment automation setup</li>
          </ul>
        </section>

        <div className="border-t border-gray-200 my-6" />

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Links</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed">
            <li>
              Website: <a className="underline" href="https://gaintrack-am9z.vercel.app/" target="_blank" rel="noreferrer">https://gaintrack-am9z.vercel.app/</a>
            </li>
            <li>
              GitHub: <span className="text-gray-500">(add your repo link)</span>
            </li>
          </ul>
        </section>

        <div className="border-t border-gray-200 my-6" />

      </div>
    </div>
  );
}

