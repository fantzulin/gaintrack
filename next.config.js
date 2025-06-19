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

      // 禁用 Terser 對特定檔案的處理
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.filter(
          plugin => {
            if (plugin.constructor && plugin.constructor.name === 'TerserPlugin') {
              // 檢查檔案路徑，如果是 HeartbeatWorker 相關檔案則跳過
              const originalTest = plugin.options.test;
              plugin.options.test = (module) => {
                if (module.resource && module.resource.includes('HeartbeatWorker')) {
                  return false;
                }
                if (originalTest) {
                  return originalTest(module);
                }
                return true;
              };
            }
            return true;
          }
        );
      }
    }
    
    return config;
  },

  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;