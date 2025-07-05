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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useWalletDeFi } from "@/hooks/useWalletAssets";
import { useCompoundPositions } from "@/hooks/useCompoundPositions";
import { useAaveSupplyData } from "@/components/defi/aave-supply";
import { useCompoundSupplyData } from "@/components/defi/compound-supply";
import { EarningsPredictor } from "@/components/defi/earnings-predictor";

export default function DeFiPage() {
  const { isConnected } = useAccount();
  const { defi, isLoading, error } = useWalletDeFi();
  const { compoundPositions, isLoading: isCompoundPositionsLoading, error: compoundPositionsError } = useCompoundPositions();
  const { supplyData: aaveData, isLoading: isAaveLoading, error: aaveError } = useAaveSupplyData();
  const { supplyData: compoundData, isLoading: isCompoundLoading, error: compoundError } = useCompoundSupplyData();
  const [mounted, setMounted] = useState(false);
  const [selectedAPY, setSelectedAPY] = useState<number>(0);
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [selectedTokenAdress, setSelectedTokenAdress] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, [defi, compoundPositions]);

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
            Please connect your wallet to view DeFi positions
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || isCompoundPositionsLoading || isAaveLoading || isCompoundLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading DeFi positions...</h1>
        </div>
      </div>
    );
  }

  if (aaveError || compoundError || compoundPositionsError) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500">{aaveError || compoundError || compoundPositionsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">DeFi Positions</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <div className="space-y-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocol</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead className="text-right">Net APY</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defi.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No DeFi positions found
                </TableCell>
              </TableRow>
            ) : (
              [...defi, ...compoundPositions]
                .filter(protocol => protocol.position.balanceUsd > 0.1)
                .map((protocol, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center">
                      <Image 
                        src={protocol.protocolLogo} 
                        alt={protocol.protocolName} 
                        width={20} 
                        height={20} 
                        className="rounded-full"
                      />
                      <span className="ml-2">{protocol.protocolName}</span>
                      {protocol.position.tokens?.map((token: any, index: any) => (
                        <>
                          {token.tokenType === "supplied" ?
                            <>
                              <Image 
                                src={token.logo} 
                                alt={token.symbol} 
                                width={20} 
                                height={20} 
                                className="rounded-full ml-2"
                              />
                              <span key={index} className="ml-2">{token.symbol}</span>
                            </>
                            : ""
                          }
                        </>
                      ))}
                    </TableCell>
                    <TableCell>
                      {protocol.position?.balanceUsd ? `$${protocol.position.balanceUsd.toFixed(2)}` : '$0.00'}
                    </TableCell>
                    <TableCell className="text-right">
                      {protocol.position?.positionDetails?.apy ? `${protocol.position.positionDetails.apy.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Aave Stable Coin Supply</h2>
            <div className="grid grid-cols-3 gap-4">
              {aaveData.map((asset, index) => (
                <Card 
                  key={index} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedToken === asset.symbol && selectedProtocol === 'aave' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedAPY(asset.supplyAPY);
                    setSelectedToken(asset.symbol);
                    setSelectedTokenAdress(asset.address);
                    setSelectedProtocol('aave');
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center">
                        <Image
                          src={asset.logo}
                          alt={asset.symbol}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        {asset.symbol}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid sm:flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Supply APY</span>
                        <span className="text-lg font-bold text-green-500">
                          {asset.supplyAPY.toFixed(2)}%
                        </span>
                      </div>
                      <div className="grid sm:flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Borrow APY</span>
                        <span className="text-lg font-bold text-red-500">
                          {asset.borrowAPY.toFixed(2)}%
                        </span>
                      </div>
                      {asset.totalSupply > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">TVL</span>
                          <span className="text-lg font-bold">
                            ${asset.totalSupply.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Compound Stable Coin Supply</h2>
            <div className="grid grid-cols-3 gap-4">
              {compoundData.map((asset, index) => (
                <Card 
                  key={index} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedToken === asset.symbol && selectedProtocol === 'compound' ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedAPY(asset.supplyAPY);
                    setSelectedToken(asset.symbol);
                    setSelectedTokenAdress(asset.address);
                    setSelectedProtocol('compound');
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center">
                        <Image
                          src={asset.logo}
                          alt={asset.symbol}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        {asset.symbol}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid sm:flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Supply APY</span>
                        <span className="text-lg font-bold text-green-500">
                          {asset.supplyAPY.toFixed(2)}%
                        </span>
                      </div>
                      <div className="grid sm:flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Borrow APY</span>
                        <span className="text-lg font-bold text-red-500">
                          {asset.borrowAPY.toFixed(2)}%
                        </span>
                      </div>
                      {asset.totalSupply > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">TVL</span>
                          <span className="text-lg font-bold">
                            ${asset.totalSupply.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <EarningsPredictor 
            currentAPY={selectedAPY} 
            selectedToken={selectedToken}
            selectedTokenAddress={selectedTokenAdress}
            selectedProtocol={selectedProtocol}
          />
        </div>
      </div>
    </div>
  );
} 