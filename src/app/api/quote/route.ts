import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellToken = searchParams.get('sellToken');
  const buyToken = searchParams.get('buyToken');
  const sellAmount = searchParams.get('sellAmount');
  const taker = searchParams.get('taker');

  if (!sellToken || !buyToken || !sellAmount || !taker) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  // 驗證 token 地址格式
  if (!sellToken.startsWith('0x') || !buyToken.startsWith('0x')) {
    return NextResponse.json({ error: 'Invalid token address format' }, { status: 400 });
  }

  // 驗證金額
  if (BigInt(sellAmount) <= 0) {
    return NextResponse.json({ error: 'Invalid sell amount' }, { status: 400 });
  }

  // 檢查 API Key
  if (!process.env.ZERO_EX_API_KEY) {
    console.error('ZERO_EX_API_KEY is not set');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const headers = {
    '0x-api-key': process.env.ZERO_EX_API_KEY,
    '0x-version': 'v2',
    'Content-Type': 'application/json',
  };

  // 使用新的 v2 API 端點
  const params = new URLSearchParams({
    sellToken: sellToken,
    buyToken: buyToken,
    sellAmount: sellAmount,
    taker: taker,
    chainId: '42161', // Arbitrum One
    slippagePercentage: '1.0'
  });

  const apiUrl = `https://api.0x.org/swap/allowance-holder/quote?${params.toString()}`;

  try {
    const response = await fetch(apiUrl, { 
      headers,
      method: 'GET'
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { reason: 'Failed to parse error response' };
      }
      
      console.error("0x API Error:", errorData);
      
      // 處理特定的錯誤情況
      if (errorData.message?.includes('no Route matched') || errorData.reason === 'NO_ROUTE') {
        return NextResponse.json(
          { 
            error: 'No trading route found for this token pair. Try a different amount or token pair.',
            details: errorData,
            suggestions: [
              'Try swapping USDC to USDT first, then USDT to WETH',
              'Try a larger amount (e.g., 100 USDC)',
              'Check if both tokens have sufficient liquidity on Arbitrum'
            ]
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: `Failed to fetch quote from 0x API: ${errorData.message || errorData.reason || 'Unknown error'}`,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Network error:", error);
    return NextResponse.json(
      { error: 'Network error while fetching quote' },
      { status: 500 }
    );
  }
}
