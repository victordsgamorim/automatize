/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@automatize/navigation'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // Disable ESLint checking during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow build to proceed with type errors
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Prevent webpack from trying to parse react-native modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native': false,
      'react-native/Libraries/Animated/NativeAnimatedHelper': false,
    };

    // Add rule to exclude react-native from bundle
    config.module.rules.push({
      test: /node_modules[/\\](react-native|@react-native-community)[/\\]/,
      use: 'null-loader',
    });

    return config;
  },
};

module.exports = nextConfig;
