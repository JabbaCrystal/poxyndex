/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deployed on Vercel, which builds and serves Next.js natively. The page is
  // client-rendered and fetches Supabase at runtime (anon key, RLS-protected),
  // so no server secrets are used. To move to a plain static host instead
  // (Cloudflare Pages / Netlify), add:  output: "export"  and point the host's
  // output directory at "out".
  reactStrictMode: true,
};

export default nextConfig;
