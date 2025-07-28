const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.moralis.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logo.moralis.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'asset.brandfetch.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'icons.llama.fi',
        pathname: '/**',
      }
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 設定 Web Workers 全域物件
      config.output.globalObject = 'self';
      
      // 處理 Node.js 模組 fallback
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      // 完全排除 Coinbase Wallet SDK
      config.resolve.alias = {
        ...config.resolve.alias,
        '@coinbase/wallet-sdk': false,
      };
    }
    
    return config;
  },

  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;