import { NextRequest, NextResponse } from 'next/server';

// ERC20 代幣的 approve 函數 ABI
const ERC20_APPROVE_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export async function POST(request: NextRequest) {
  try {
    const { tokenAddress, spenderAddress, amount } = await request.json();

    if (!tokenAddress || !spenderAddress || !amount) {
      return NextResponse.json({ 
        error: 'Missing required parameters: tokenAddress, spenderAddress, amount' 
      }, { status: 400 });
    }

    // 編碼 approve 函數調用
    const { encodeFunctionData } = await import('viem');
    
    const approveData = encodeFunctionData({
      abi: ERC20_APPROVE_ABI,
      functionName: 'approve',
      args: [spenderAddress, amount]
    });

    return NextResponse.json({
      success: true,
      data: approveData,
      message: 'Approve transaction data generated'
    });

  } catch (error) {
    console.error('Error generating approve data:', error);
    return NextResponse.json({ 
      error: 'Failed to generate approve transaction data' 
    }, { status: 500 });
  }
} 