import { NextRequest, NextResponse } from 'next/server';

// 0x 協議在不同網絡上的合約地址
const ZEROX_CONTRACTS: Record<string, any> = {
  // Arbitrum One 網絡 - 主要路由器
  '0x0000000000001ff3684f28c67538d4d072c22734': {
    name: '0x Protocol Router',
    description: 'Main 0x Protocol router contract for token swaps on Arbitrum',
    type: 'Router',
    network: 'Arbitrum One',
    verified: true
  },
  
  // Ethereum Mainnet
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': {
    name: '0x Protocol Router',
    description: 'Main 0x Protocol router contract for token swaps on Ethereum',
    type: 'Router',
    network: 'Ethereum Mainnet',
    verified: true
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address parameter is required' });
  }

  const contractInfo = ZEROX_CONTRACTS[address.toLowerCase()];
  
  if (contractInfo) {
    return NextResponse.json({
      address: address,
      isZeroXContract: true,
      ...contractInfo
    });
  } else {
    return NextResponse.json({
      address: address,
      isZeroXContract: false,
      message: 'This address is not a known 0x Protocol contract',
      note: '0x Protocol uses different addresses on different networks'
    });
  }
} 