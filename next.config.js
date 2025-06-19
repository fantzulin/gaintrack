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
      // 處理 Terser 配置
      if (config.optimization && Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
          if (plugin.constructor && plugin.constructor.name === 'TerserPlugin') {
            // 更新 Terser 選項以支援模組語法
            plugin.options = {
              ...plugin.options,
              exclude: /HeartbeatWorker/,
              terserOptions: {
                ...plugin.options.terserOptions,
                module: true,
                parse: {
                  ecma: 2020,
                },
                compress: {
                  module: true,
                },
                mangle: {
                  module: true,
                },
              },
            };
          }
          return plugin;
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