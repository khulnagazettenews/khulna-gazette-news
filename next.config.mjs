/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'https://khulnagazette.com/wp-content/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
