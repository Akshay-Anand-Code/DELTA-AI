/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this to handle the document not defined error during static generation
  experimental: {
    // This will ensure proper client-side hydration
    optimizeFonts: true,
    // Disable static generation for pages that need client-side features
    workerThreads: true,
  },
};

export default nextConfig;
