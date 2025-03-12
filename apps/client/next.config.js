/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['shared'],
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};

module.exports = nextConfig; 