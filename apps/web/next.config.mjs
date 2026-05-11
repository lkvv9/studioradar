/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@studioradar/shared"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
