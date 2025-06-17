import Moralis from 'moralis';
// import { useNetwork } from 'wagmi'; // 已移除未使用的 import

// 初始化 Moralis
export const initMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
    });
  }
};

// 獲取錢包代幣餘額
export const getWalletTokenBalances = async (address: string, chainId: string) => {
  try {
    const response = await Moralis.EvmApi.token.getWalletTokenBalances({
      chain: chainId,
      address,
    });
    return response.raw;
  } catch (error) {
    console.error('Error fetching wallet token balances:', error);
    return [];
  }
};

// 獲取錢包原生代幣餘額
export const getNativeBalance = async (address: string, chainId: string) => {
  try {
    const response = await Moralis.EvmApi.balance.getNativeBalance({
      chain: chainId,
      address,
    });

    return response.result;
  } catch (error) {
    console.error('Error fetching native balance:', error);
    return null;
  }
};

// 獲取代幣價格
export const getTokenPrice = async (address: string, chainId: string) => {
  try {
    const response = await Moralis.EvmApi.token.getTokenPrice({
      chain: chainId,
      address,
    });

    return response.result;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return null;
  }
};

// 取得錢包所有資產（含原生幣、ERC20、價格）
export const getWalletAssets = async (address: string, chainId: string) => {
  try {
    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: chainId,
      address,
    });
    return response.result;
  } catch (error) {
    console.error('Error fetching wallet assets:', error);
    return [];
  }
};

export const getDefiPositionsSummary = async (address: string, chainId: string) => {
  try {
    const response = await Moralis.EvmApi.wallets.getDefiPositionsSummary({
      chain: chainId,
      address,
    });
    return response.result;
  } catch (error) {
    console.error('Error fetching defi positions summary:', error);
    return [];
  }
};