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

interface SupplyButtonProps {
  protocol: "aave" | "compound" | "dolomite";
  tokenSymbol: string;
  tokenAddress: string;
  marketAddress: string;
  currentAPY: number;
  walletBalance: number;
  tokenDecimals: number;
  dolomiteMarketId: number;
}

// ERC20 ABI for approve function and allowance
const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

// Aave V3 Pool ABI for supply function
const AAVE_POOL_ABI = [
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" }
    ],
    outputs: []
  }
] as const;

// Compound V3 Comet ABI for supply function
const COMPOUND_COMET_ABI = [
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: []
  }
] as const;

// Dolomite ABI for supply function
const Dolomite_ABI = [
  {
    name: "depositWei",
    type: "function",
    inputs:[
      { name: "_isolationModeMarketId", type: "uint256" },
      { name: "_toAccountNumber", type: "uint256" },
      { name:  "_marketId", type: "uint256" },
      { name: "_amountWei", type: "uint256" },
      { name: "_eventFlag", type: "uint8" },
    ],
    outputs: []
  }
]

export function SupplyButton({ protocol, tokenSymbol, tokenAddress, marketAddress, currentAPY, walletBalance, tokenDecimals, dolomiteMarketId }: SupplyButtonProps) {
  const { address, isConnected, chainId } = useAccount();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"approve" | "supply" | "complete">("approve");
  const processedHashRef = useRef<string | null>(null);

  // Read current allowance
  const { data: currentAllowance, isLoading: isAllowanceLoading, error: allowanceError } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, marketAddress as `0x${string}`],
    query: {
      enabled: !!address && !!tokenAddress && !!marketAddress,
    },
  });

  // Single write contract hook for all transactions
  const { 
    data: hash, 
    writeContract,
    isPending,
    error 
  } = useWriteContract();

  // Wait for transaction receipt
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  const handleApprove = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const amountWei = parseUnits(amount, tokenDecimals);
      
      // Check if current allowance is sufficient
      if (currentAllowance && currentAllowance >= amountWei) {
        toast.success("Allowance is sufficient, proceeding to supply");
        setStep("supply");
        return;
      }

      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [marketAddress as `0x${string}`, amountWei],
      });

      toast.success("Approval transaction initiated!");
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve tokens");
    }
  };

  const handleSupply = async () => {
    if (!isConnected || !address || !amount) {
      toast.error("Please connect wallet and enter amount");
      return;
    }

    try {
      const amountWei = parseUnits(amount, tokenDecimals);
      
      if (protocol === "aave") {
        writeContract({
          address: marketAddress as `0x${string}`,
          abi: AAVE_POOL_ABI,
          functionName: "supply",
          args: [tokenAddress as `0x${string}`, amountWei, address, 0], // referralCode = 0
        });
      } else if (protocol === "compound") {
        writeContract({
          address: marketAddress as `0x${string}`,
          abi: COMPOUND_COMET_ABI,
          functionName: "supply",
          args: [tokenAddress as `0x${string}`, amountWei],
        });
      } else if (protocol === "dolomite") {
        writeContract({
          address: marketAddress as `0x${string}`,
          abi: Dolomite_ABI,
          functionName: "depositWei",
          args: [
            0,
            0,
            BigInt(dolomiteMarketId), // _marketId
            amountWei, // _amountWei
            0, // _eventFlag
          ],
        });
      }

      toast.success(`Supply ${amount} ${tokenSymbol} to ${protocol.toUpperCase()} initiated!`);
    } catch (error) {
      console.error("Supply error:", error);
      toast.error("Failed to supply tokens");
    }
  };

  // Handle transaction completion - improved logic
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

      if (step === "approve") {
        setStep("supply");
        toast.success("Approval completed! Please proceed with supply.");
        processedHashRef.current = hash;
      } else if (step === "supply") {
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
          toast.success("Supply completed successfully!");
        }
        processedHashRef.current = hash;
      }
    }
  }, [hash, isConfirming, step, chainId]);

  const isProcessing = isPending || isConfirming;

  // Format current allowance for display
  const formattedAllowance = currentAllowance ? formatUnits(currentAllowance, tokenDecimals) : "0";
  const needsApproval = amount && currentAllowance ? parseUnits(amount, tokenDecimals) > currentAllowance : true;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={!isConnected}
          className="ml-auto"
        >
          Supply {tokenSymbol}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Supply {tokenSymbol} to {protocol.toUpperCase()}</DialogTitle>
          <DialogDescription>
            Supply your {tokenSymbol} to earn {currentAPY.toFixed(2)}% APY
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
            <p>Protocol: {protocol.toUpperCase()}</p>
            <p>APY: {currentAPY.toFixed(2)}%</p>
            <p>Token: {tokenSymbol}</p>
            <p>Wallet Balance: ${walletBalance.toLocaleString()}</p>
            {!isAllowanceLoading && (
              <p>Current Allowance: {formattedAllowance} {tokenSymbol}</p>
            )}
            {amount && !needsApproval && (
              <p className="text-green-600">✓ Allowance sufficient, no approval needed</p>
            )}
            {amount && needsApproval && currentAllowance && (
              <p className="text-orange-600">⚠ Approval needed for {amount} {tokenSymbol}</p>
            )}
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
        </div>
        <DialogFooter>
          {step === "approve" && (
            <Button 
              onClick={handleApprove} 
              disabled={isProcessing || !amount}
            >
              {isProcessing ? "Processing..." : needsApproval ? `Approve ${tokenSymbol}` : `Supply ${tokenSymbol}`}
            </Button>
          )}
          {step === "supply" && (
            <Button 
              onClick={handleSupply} 
              disabled={isProcessing}
            >
              {isProcessing ? "Supplying..." : `Supply ${tokenSymbol}`}
            </Button>
          )}
          {step === "complete" && (
            <Button 
              onClick={() => {
                setIsOpen(false);
                setAmount("");
                setStep("approve");
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