/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support file uploads & external packages if needed
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
};

export default nextConfig;
