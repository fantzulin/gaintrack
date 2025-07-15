import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get('chainId') || '42161'; // 預設 Arbitrum

    // 使用官方 API 獲取支援的 sources
    const response = await fetch(`https://api.0x.org/sources?chainId=${chainId}`, {
      headers: {
        '0x-api-key': process.env.ZERO_EX_API_KEY || '',
        '0x-version': 'v2',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sources: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      chainId: chainId,
      totalSources: data.sources?.length || 0,
      sources: data.sources || [],
      note: `Official sources for chain ${chainId} from 0x API`
    });

  } catch (error) {
    console.error('Error fetching supported protocols:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch supported protocols',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 