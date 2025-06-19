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
      // 更激進的方法：完全禁用 Terser 對特定檔案的處理
      if (config.optimization && Array.isArray(config.optimization.minimizer)) {
        const originalMinimizers = config.optimization.minimizer;
        config.optimization.minimizer = [];
        
        originalMinimizers.forEach((plugin) => {
          if (plugin.constructor && plugin.constructor.name === 'TerserPlugin') {
            // 創建新的 Terser 實例，排除問題檔案
            const TerserPlugin = plugin.constructor;
            config.optimization.minimizer.push(
              new TerserPlugin({
                ...plugin.options,
                exclude: [
                  /HeartbeatWorker/,
                  /static\/media\/HeartbeatWorker/,
                  /coinbase.*wallet.*sdk.*HeartbeatWorker/,
                ],
                terserOptions: {
                  ...plugin.options.terserOptions,
                  ecma: 2020,
                  module: true,
                  parse: {
                    ecma: 2020,
                  },
                  compress: {
                    module: true,
                    ecma: 2020,
                  },
                  mangle: {
                    module: true,
                  },
                  format: {
                    ecma: 2020,
                  },
                },
              })
            );
          } else {
            config.optimization.minimizer.push(plugin);
          }
        });
      }

      // 設定 Web Workers 全域物件
      config.output.globalObject = 'self';
      
      // 處理 Node.js 模組 fallback
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },

  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;