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

  webpack: (config) => {
    // ignore heartbeat worker
    if (config.optimization && Array.isArray(config.optimization.minimizer)) {
      config.optimization.minimizer = config.optimization.minimizer.map((plugin) => {
        if (
          plugin.constructor &&
          plugin.constructor.name === 'TerserPlugin' &&
          plugin.options &&
          plugin.options.exclude === undefined
        ) {
          plugin.options.exclude = /HeartbeatWorker/;
        }
        return plugin;
      });
    }
    return config;
  },

  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;