/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: '', // Thay bằng URL Supabase của bạn
    NEXT_PUBLIC_SUPABASE_ANON_KEY: '', // Thay bằng anon key Supabase của bạn
  },
};

module.exports = nextConfig;
