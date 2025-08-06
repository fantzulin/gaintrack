"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";

interface WithdrawButtonProps {
  protocol: "aave" | "compound" | "dolomite";
  tokenSymbol: string;
  tokenAddress: string;
  marketAddress: string;
  suppliedBalance: number;
  tokenDecimals: number;
  dolomiteMarketId: number;
}

// Aave V3 Pool ABI for withdraw function
const AAVE_POOL_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "withdraw",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Compound V3 Comet ABI for withdraw function
const COMPOUND_COMET_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "asset",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Dolomite ABI for withdraw function
const Dolomite_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_isolationModeMarketId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_fromAccountNumber",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_marketId",
        "type": "uint256"
      },
      { 
        "internalType": "uint256",
        "name": "_amountWei",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_balanceCheckFlag",
        "type": "uint8"
      }
    ],
    "name": "withdrawWei",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// ERC20 ABI for decimals function
const ERC20_DECIMALS_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export function WithdrawButton({ protocol, tokenSymbol, tokenAddress, marketAddress, suppliedBalance, tokenDecimals, dolomiteMarketId }: WithdrawButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"withdraw" | "complete">("withdraw");
  const processedHashRef = useRef<string | null>(null);

  const { data: fetchedDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_DECIMALS_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress && tokenDecimals === undefined,
    },
  });

  const decimals = tokenDecimals ?? fetchedDecimals;

  const { 
    data: hash, 
    writeContract,
    isPending,
    error 
  } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWithdraw = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    if (decimals === undefined) {
      toast.error("Could not determine token decimals. Please try again.");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const amountWei = parseUnits(amount, decimals);
      
      (protocol === "aave") ?
        writeContract({
          address: marketAddress as `0x${string}`,
          abi: AAVE_POOL_ABI,
          functionName: "withdraw",
          args: [tokenAddress as `0x${string}`, amountWei, address as `0x${string}`],
        })
      : (protocol === "compound") ?
        writeContract({
          address: marketAddress as `0x${string}`,
          abi: COMPOUND_COMET_ABI,
          functionName: "withdraw",
          args: [tokenAddress as `0x${string}`, amountWei],
        })
      : (protocol === "dolomite")
        writeContract({
          address: marketAddress as `0x${string}`,
          abi: Dolomite_ABI,
          functionName: "withdrawWei",
          args: [BigInt(0), BigInt(0), BigInt(dolomiteMarketId), amountWei, Number(1)],
        });

      toast.success(`Withdraw ${amount} ${tokenSymbol} from ${protocol.toUpperCase()} initiated!`);
    } catch (error) {
      console.error("Withdraw error:", error);
      toast.error("Failed to withdraw tokens");
    }
  };

  useEffect(() => {
    if (hash && hash !== processedHashRef.current && !isConfirming) {
      let explorerUrl = "";
      let explorerName = "";

      switch (chainId) {
        case 1:
          explorerUrl = `https://etherscan.io/tx/${hash}`;
          explorerName = "Etherscan";
          break;
        case 42161:
          explorerUrl = `https://arbiscan.io/tx/${hash}`;
          explorerName = "Arbiscan";
          break;
      }

      if (step === "withdraw") {
        setStep("complete");
        if (explorerUrl) {
          const toastMessage = (
            <div>
              <p>Transaction successful!</p>
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View on {explorerName}
              </a>
            </div>
          );
          toast.success(toastMessage);
        } else {
          toast.success("Withdraw completed successfully!");
        }
        processedHashRef.current = hash;
      }
    }
  }, [hash, isConfirming, step, chainId]);

  const isProcessing = isPending || isConfirming;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={!isConnected}
          className="ml-auto"
        >
          Withdraw {tokenSymbol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Withdraw {tokenSymbol} from {protocol.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Enter the amount of {tokenSymbol} you want to withdraw.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              disabled={isProcessing}
            />
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Supplied Balance: ${suppliedBalance.toLocaleString()}</p>
          </div>
          {error && (
              <div className="text-red-500 mt-2 sm:max-w-[375px]">
                <pre className="overflow-hidden text-ellipsis">{error.message}</pre>
                <Button 
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(error.message);
                    toast.success("Error copied to clipboard");
                  }}
                >
                  Copy Error
                </Button>
              </div>
            )}
        </div>
        <DialogFooter>
          {step === "withdraw" && (
            <Button 
              onClick={handleWithdraw} 
              disabled={isProcessing || !amount}
            >
              {isProcessing ? "Withdrawing..." : `Withdraw ${tokenSymbol}`}
            </Button>
          )}
          {step === "complete" && (
            <Button 
              onClick={() => {
                setIsOpen(false);
                setAmount("");
                setStep("withdraw");
              }}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
