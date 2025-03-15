/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Monaco Editor Webpack config
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        "crypto": false,
      };
    }

    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource'
    });

    return config;
  },
  // Disable server-side rendering for pages with Monaco Editor
  reactStrictMode: true,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 