"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useWalletAssets } from "@/hooks/useWalletAssets";
import { useSheetAssets } from "@/hooks/useSheetAssets";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { assets: walletAssets, isLoading: walletLoading, error: walletError } = useWalletAssets();
  const { assets: sheetAssets, isLoading: sheetLoading, error: sheetError } = useSheetAssets();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 在客戶端渲染之前，顯示一個加載狀態
  if (!mounted) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground">
            Please connect your wallet to view your assets
          </p>
        </div>
      </div>
    );
  }

  if (walletLoading || sheetLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Assets...</h1>
        </div>
      </div>
    );
  }

  if (walletError || sheetError) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500">{walletError || sheetError}</p>
          {/* 調試信息 */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Sheet Assets: {JSON.stringify(sheetAssets)}</p>
            <p>Wallet Assets Count: {walletAssets?.length || 0}</p>
          </div>
        </div>
      </div>
    );
  }

  const safeWalletAssets = Array.isArray(walletAssets) ? walletAssets : [];
  const safeSheetAssets = Array.isArray(sheetAssets) ? sheetAssets : [];
  const mergedAssets = safeWalletAssets
  .filter(asset => asset && asset.usdValue && Number(asset.usdValue.toFixed(2)) > 1)
  .map(asset => {
    const assetAddress = asset.tokenAddress?._value || asset.token_address || "";
    const sheetAsset = safeSheetAssets.find(
      sheetAsset =>
        sheetAsset &&
        sheetAsset.tokenAddress &&
        assetAddress &&
        sheetAsset.tokenAddress.toLowerCase() === assetAddress.toLowerCase()
    );
    return {
      ...asset,
      costPrice: sheetAsset?.costPrice || "0"
    };
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Asset Dashboard</h1>
        <Button variant="ghost" asChild>
          <Link href="/add">Add Cost Price</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Cost Price</TableHead>
            <TableHead className="text-right">USD Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mergedAssets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No assets found or all assets have value less than $1
              </TableCell>
            </TableRow>
          ) : (
            mergedAssets.map((asset, index) => (
              <TableRow key={`${asset.token_address || 'unknown'}-${asset.type || 'token'}-${index}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {asset.logo && (
                      <Image
                        src={asset.logo}
                        alt={asset.symbol || 'Token'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <div>{asset.symbol || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">{asset.name || 'Unknown Token'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {(() => {
                    const balance = asset.balance || 0;
                    const decimals = asset.decimals || 18;
                    const value = Number(balance) / Math.pow(10, decimals);
                    return isNaN(value) ? '0' : value.toString();
                  })()}
                </TableCell>
                <TableCell className="text-right">
                  ${asset.costPrice || '0'}
                </TableCell>
                <TableCell className="text-right">
                  <span className={asset.costPrice > 0 && asset.costPrice < asset.usdValue ? 'text-lime-500' :
                    asset.costPrice > asset.usdValue ? 'text-red-500' : ''}>
                    ${asset.usdValue ? asset.usdValue.toFixed(2) : '0.00'}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}