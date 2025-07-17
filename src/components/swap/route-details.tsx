import { formatUnits } from "viem";
import protocols from "@/lib/protocols.json";
import { ARBITRUM_TOKENS } from "@/lib/tokens";

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
        <div className="flow-root">
          <ul className="-mb-8">
            {quote.route.fills.map((fill: any, index: number) => {
              // 獲取代幣信息
              const fromToken = quote.route.tokens?.find((t: any) => 
                t.address.toLowerCase() === fill.from.toLowerCase()
              );
              const toToken = quote.route.tokens?.find((t: any) => 
                t.address.toLowerCase() === fill.to.toLowerCase()
              );

              const fromTokenInfo = ARBITRUM_TOKENS.find(
                (t) => t.address.toLowerCase() === fill.from.toLowerCase()
              );
              const toTokenInfo = ARBITRUM_TOKENS.find(
                (t) => t.address.toLowerCase() === fill.to.toLowerCase()
              );

              const protocol = protocols.find(
                (p) => p.name.toLowerCase() === fill.source.split('_')[0].toLowerCase()
              );
              
              return (
                <li key={index}>
                  <div className="relative pb-8">
                    {index !== quote.route.fills.length - 1 ? (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-blue-300" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div>
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ring-8 ring-blue-50">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 text-sm text-blue-700 bg-blue-100 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          {protocol ? (
                            <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
                              <img src={protocol.logo} alt={protocol.name} className="w-5 h-5 rounded-full" />
                              <span className="font-medium">{fill.source}</span>
                            </a>
                          ) : (
                            <span className="text-blue-600 font-medium">{fill.source}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="flex items-center text-xs">
                            {fromTokenInfo && <img src={fromTokenInfo.logoURI} alt={fromTokenInfo.symbol} className="w-4 h-4 mr-1.5 rounded-full" />}
                            From: {fromToken?.symbol || 'Unknown'} 
                            <span className="text-gray-500 ml-1">
                              ({fill.from.slice(0, 6)}...{fill.from.slice(-4)})
                            </span>
                          </span>
                          <span className="flex items-center text-xs">
                            {toTokenInfo && <img src={toTokenInfo.logoURI} alt={toTokenInfo.symbol} className="w-4 h-4 mr-1.5 rounded-full" />}
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
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
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