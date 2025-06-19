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

      // 更簡單的方法：排除 HeartbeatWorker 相關檔案
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((plugin) => {
          if (plugin.constructor && plugin.constructor.name === 'TerserPlugin') {
            plugin.options.exclude = [
              /HeartbeatWorker/,
              /static\/media\/HeartbeatWorker/,
              /coinbase.*wallet.*sdk.*HeartbeatWorker/,
            ];
          }
        });
      }
    }
    
    return config;
  },

  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;