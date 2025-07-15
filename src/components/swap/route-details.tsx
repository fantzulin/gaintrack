import { formatUnits } from "viem";

interface RouteDetailsProps {
  quote: any;
}

export function RouteDetails({ quote }: RouteDetailsProps) {
  if (!quote?.route?.fills) {
    return null;
  }

  return (
    <div className="w-[450px] mt-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-800 mb-3">
          🔄 Swap Route Details
        </p>
        <div className="space-y-3">
          {quote.route.fills.map((fill: any, index: number) => {
            // 獲取代幣信息
            const fromToken = quote.route.tokens?.find((t: any) => 
              t.address.toLowerCase() === fill.from.toLowerCase()
            );
            const toToken = quote.route.tokens?.find((t: any) => 
              t.address.toLowerCase() === fill.to.toLowerCase()
            );
            
            return (
              <div key={index} className="text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Step {index + 1}</span>
                  <span className="text-blue-600 font-medium">{fill.source}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs">
                    From: {fromToken?.symbol || 'Unknown'} 
                    <span className="text-gray-500 ml-1">
                      ({fill.from.slice(0, 6)}...{fill.from.slice(-4)})
                    </span>
                  </span>
                  <span className="text-xs">
                    To: {toToken?.symbol || 'Unknown'}
                    <span className="text-gray-500 ml-1">
                      ({fill.to.slice(0, 6)}...{fill.to.slice(-4)})
                    </span>
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-blue-600 font-medium">
                    {fill.proportionBps === "10000" 
                      ? "100%" 
                      : `${parseInt(fill.proportionBps) / 100}%`
                    } of trade
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-xs text-blue-600 space-y-1">
          <p>Total steps: {quote.route.fills.length}</p>
          <p>Route will be executed through 0x Protocol</p>
          {quote.route.tokens && (
            <p>Involved tokens: {quote.route.tokens.map((t: any) => t.symbol).join(', ')}</p>
          )}
          <div className="mt-2 pt-2 border-t border-blue-200">
            <p className="font-medium text-blue-700">Supported Protocols on Arbitrum:</p>
            <p className="text-xs text-blue-600">
              Uniswap V2/V3/V4, SushiSwap, Balancer, Curve, 1inch, Kyber, Bancor, DODO, and more...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 