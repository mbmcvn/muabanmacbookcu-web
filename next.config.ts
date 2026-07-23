import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePattern = (() => {
  if (!supabaseUrl) return [];
  const url = new URL(supabaseUrl);
  return [{ protocol: url.protocol.slice(0, -1) as "http" | "https", hostname: url.hostname, pathname: "/storage/v1/object/public/**" }];
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...supabaseImagePattern,
      { protocol: "https", hostname: "img.mbmc.vn", pathname: "/machines/**" },
    ],
  },
   async redirects() {
    return [
      {
        source: "/care/:path*",
        destination: "https://mbmc-care.vercel.app/care/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
