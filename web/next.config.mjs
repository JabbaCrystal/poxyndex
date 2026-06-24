/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static site — deploys on Vercel/Cloudflare Pages/Netlify with no server.
  // Data is fetched client-side from Supabase (anon key, RLS-protected).
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
