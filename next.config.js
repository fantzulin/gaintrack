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

      // 完全禁用 Terser 的模組模式
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((plugin) => {
          if (plugin.constructor && plugin.constructor.name === 'TerserPlugin') {
            plugin.options.terserOptions = {
              ...plugin.options.terserOptions,
              module: false,
              parse: {
                ...plugin.options.terserOptions?.parse,
                ecma: 2020,
              },
              compress: {
                ...plugin.options.terserOptions?.compress,
                module: false,
              },
              mangle: {
                ...plugin.options.terserOptions?.mangle,
                module: false,
              },
              format: {
                ...plugin.options.terserOptions?.format,
                ecma: 2020,
              },
            };
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