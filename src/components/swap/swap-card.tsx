'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenSelector } from "./token-selector";
import { ARBITRUM_TOKENS, Token } from "@/lib/tokens";
import { useWalletAssets } from "@/hooks/useWalletAssets";
import { useAccount, useWalletClient } from "wagmi";
import { formatUnits, parseUnits } from "viem";

const shortenAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface SwapCardProps {
  onQuoteUpdate?: (quote: any) => void;
  onContractInfoUpdate?: (info: any) => void;
}

export function SwapCard({ onQuoteUpdate, onContractInfoUpdate }: SwapCardProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [sellToken, setSellToken] = useState<Token>(ARBITRUM_TOKENS[0]); // Default to USDC
  const [buyToken, setBuyToken] = useState<Token>(ARBITRUM_TOKENS[2]); // Default to DAI
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapStatus, setSwapStatus] = useState<string>("");
  const { assets } = useWalletAssets();

  const sellTokenBalance = assets.find(asset => asset.tokenAddress._value.toLowerCase() === sellToken.address.toLowerCase());
  const buyTokenBalance = assets.find(asset => asset.tokenAddress._value.toLowerCase() === buyToken.address.toLowerCase());

  useEffect(() => {
    const fetchQuote = async () => {
      if (parseFloat(sellAmount) > 0 && address) {
        setIsFetchingQuote(true);
        try {
          const sellAmountInWei = parseUnits(sellAmount, sellToken.decimals);
          
          // 檢查最小金額 - 使用 token 配置中的最小金額
          const minAmount = sellToken.minAmount || '0.001'; // 預設值
          const minAmountInWei = parseUnits(minAmount, sellToken.decimals);
          
          if (sellAmountInWei < minAmountInWei) {
            setBuyAmount("");
            setQuote(null);
            setErrorMessage(`Minimum amount required: ${minAmount} ${sellToken.symbol}`);
            return;
          }
          
          const response = await fetch(
            `/api/quote?sellToken=${sellToken.address}&buyToken=${buyToken.address}&sellAmount=${sellAmountInWei}&taker=${address}`
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Quote API error:', errorData);
            
            // 處理特定錯誤
            if (errorData.error?.includes('No trading route found')) {
              throw new Error('No trading route available for this token pair. Try a different amount or token pair.');
            }
            
            throw new Error(errorData.error || 'Failed to fetch quote');
          }
          
          const data = await response.json();
          
          // 驗證 0x 合約地址
          if (data.transaction?.to) {
            try {
              const validateResponse = await fetch(`/api/validate-0x-address?address=${data.transaction.to}`);
              if (validateResponse.ok) {
                const contractInfo = await validateResponse.json();
                onContractInfoUpdate?.(contractInfo);
              } else {
                onContractInfoUpdate?.(null);
              }
            } catch (error) {
              onContractInfoUpdate?.(null);
              console.log('Could not validate 0x address:', error);
            }
          } else {
            onContractInfoUpdate?.(null);
          }
          
          setQuote(data);
          setBuyAmount(formatUnits(BigInt(data.buyAmount), buyToken.decimals));
          onQuoteUpdate?.(data);
          
          // 檢查餘額問題
          if (data.issues?.balance) {
            const { actual, expected } = data.issues.balance;
            const actualBalance = parseFloat(formatUnits(BigInt(actual), sellToken.decimals));
            const expectedAmount = parseFloat(formatUnits(BigInt(expected), sellToken.decimals));
            
            if (actualBalance < expectedAmount) {
              const shortfall = expectedAmount - actualBalance;
              setErrorMessage(
                `💰 Insufficient balance\n\nYou have: ${actualBalance.toFixed(2)} ${sellToken.symbol}\nYou need: ${expectedAmount.toFixed(2)} ${sellToken.symbol}\nShortfall: ${shortfall.toFixed(2)} ${sellToken.symbol}`
              );
            } else {
              setErrorMessage(""); // 清除錯誤訊息
            }
          } else {
            setErrorMessage(""); // 清除錯誤訊息
          }
        } catch (error) {
          console.error('Error fetching quote:', error);
          setBuyAmount("");
          setQuote(null);
          onQuoteUpdate?.(null);
          onContractInfoUpdate?.(null);
          setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch quote');
        } finally {
          setIsFetchingQuote(false);
        }
      } else {
        setBuyAmount("");
        setQuote(null);
        onQuoteUpdate?.(null);
        onContractInfoUpdate?.(null);
        setErrorMessage(""); // 清除錯誤訊息
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [sellAmount, sellToken, buyToken, address]);

  const handleSwitchTokens = () => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setSellAmount(buyAmount);
  };

  const handleSwap = async () => {
    if (!quote || !walletClient || !address) {
      console.error('Missing required data for swap');
      setErrorMessage('Please connect your wallet first');
      return;
    }

    setIsSwapping(true);
    setSwapStatus("Preparing transaction...");
    setErrorMessage("");

    try {
      // 檢查餘額問題
      if (quote.issues?.balance) {
        const { actual, expected } = quote.issues.balance;
        if (BigInt(actual) < BigInt(expected)) {
          throw new Error('Insufficient balance for swap');
        }
      }

      // 檢查授權問題
      if (quote.issues?.allowance?.actual === '0') {
        setSwapStatus("Approving token...");
        
        // 需要先授權
        const spender = quote.issues.allowance.spender;
        const amount = quote.sellAmount;
        
        try {
          // 獲取授權交易數據
          const approveResponse = await fetch('/api/approve-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tokenAddress: sellToken.address,
              spenderAddress: spender,
              amount: amount
            })
          });

          if (!approveResponse.ok) {
            throw new Error('Failed to generate approve transaction');
          }

          const approveData = await approveResponse.json();
          
          // 發送授權交易
          const approveHash = await walletClient.sendTransaction({
            to: sellToken.address as `0x${string}`,
            data: approveData.data as `0x${string}`,
            gas: BigInt(50000), // 授權交易的 gas 限制
            gasPrice: BigInt(quote.transaction.gasPrice)
          });

          setSwapStatus(`Approval sent! Hash: ${approveHash}. Please wait for confirmation...`);
          
          // 等待授權確認（這裡可以添加輪詢邏輯）
          // 暫時直接繼續執行 swap
          console.log('Approval transaction hash:', approveHash);
          
        } catch (error) {
          console.error('Approval error:', error);
          setErrorMessage('Failed to approve token. Please try again.');
          return;
        }
      }

      setSwapStatus("Sending transaction...");

      // 準備交易參數
      const transaction = quote.transaction;
      
      // 發送交易
      const hash = await walletClient.sendTransaction({
        to: transaction.to as `0x${string}`,
        data: transaction.data as `0x${string}`,
        gas: BigInt(transaction.gas),
        gasPrice: BigInt(transaction.gasPrice),
        value: BigInt(transaction.value)
      });

      setSwapStatus(`Transaction sent! Hash: <a href="https://arbiscan.io/tx/${hash}" target="_blank" rel="noopener noreferrer" className="underline">${shortenAddress(hash)}</a>`);

      // 清空輸入欄位
      setSellAmount("");
      setBuyAmount("");
      setQuote(null);

    } catch (error) {
      console.error('Swap error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to execute swap');
      setSwapStatus("");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <Card className="w-[450px]">
      <CardHeader>
        <CardTitle>Swap</CardTitle>
        <CardDescription>Trade tokens at the best price on Arbitrum.</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="sell">You sell</Label>
            <span className="text-right text-sm text-muted-foreground">
              Balance: {sellTokenBalance ? `${parseFloat(formatUnits(BigInt(sellTokenBalance.balance), sellToken.decimals)).toFixed(2)}` : '0.0'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              id="sell" 
              type="number"
              placeholder="0.0" 
              value={sellAmount}
              onChange={(e) => setSellAmount(e.target.value)}
              className="text-lg"
            />
            <TokenSelector onSelect={setSellToken}>
              <Button variant="outline" className="flex items-center gap-2">
                <Image src={sellToken.logoURI} alt={sellToken.name} width={24} height={24} />
                <span>{sellToken.symbol}</span>
              </Button>
            </TokenSelector>
          </div>
        </div>

        <div className="grid gap-2 mt-4">
           <div className="grid grid-cols-2 gap-2">
            <Label htmlFor="buy">You buy</Label>
            <span className="text-right text-sm text-muted-foreground">
              Balance: {buyTokenBalance ? `${parseFloat(formatUnits(BigInt(buyTokenBalance.balance), buyToken.decimals)).toFixed(2)}` : '0.0'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              id="buy" 
              type="number"
              placeholder="0.0" 
              value={isFetchingQuote ? "..." : buyAmount}
              readOnly
              className="text-lg"
            />
            <TokenSelector onSelect={setBuyToken}>
              <Button variant="outline" className="flex items-center gap-2">
                <Image src={buyToken.logoURI} alt={buyToken.name} width={24} height={24} />
                <span>{buyToken.symbol}</span>
              </Button>
            </TokenSelector>
          </div>
        </div>
        
        {/* 錯誤訊息顯示 */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 whitespace-pre-line">{errorMessage}</p>
          </div>
        )}
        
        {/* 交易狀態顯示 */}
        {swapStatus && !errorMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600" dangerouslySetInnerHTML={{ __html: swapStatus }} />
          </div>
        )}
        
        {/* 費用信息顯示 */}
        {quote?.fees && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              💰 Fee Breakdown
            </p>
            <div className="space-y-1 text-xs text-yellow-700">
              {quote.fees.zeroExFee && (
                <div className="flex justify-between">
                  <span>0x Protocol Fee:</span>
                  <span>{formatUnits(BigInt(quote.fees.zeroExFee.amount), buyToken.decimals)} {buyToken.symbol}</span>
                </div>
              )}
              {quote.fees.gasFee && (
                <div className="flex justify-between">
                  <span>Estimated Gas:</span>
                  <span>{quote.transaction?.gas} units</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Total Network Fee:</span>
                <span>{formatUnits(BigInt(quote.totalNetworkFee), 18)} ETH</span>
              </div>
            </div>
          </div>
        )}
        

      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full"
          onClick={handleSwap}
          disabled={!isConnected || isFetchingQuote || isSwapping || !quote || parseFloat(sellAmount) <= 0 || errorMessage.includes('Insufficient balance')}
        >
          {!isConnected ? "Connect Wallet" : isFetchingQuote ? "Fetching Quote..." : isSwapping ? swapStatus : "Swap"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Powered by <a href="https://0x.org/" target="_blank" rel="noopener noreferrer" className="underline">0x</a>
        </p>
      </CardFooter>
    </Card>
  );
}