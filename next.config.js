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
    config.output.module = true;
    return config;
  },

  experimental: {
    esmExternals: 'loose',
  },
};

module.exports = nextConfig;