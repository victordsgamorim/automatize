/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@automatize/navigation', '@automatize/content'],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: {
      // Prevent Turbopack from trying to resolve react-native modules on web
      'react-native': '',
      'react-native/Libraries/Animated/NativeAnimatedHelper': '',
      '@react-native-community/netinfo': '',
      '@react-native-async-storage/async-storage': '',
    },
  },
};

module.exports = nextConfig;
