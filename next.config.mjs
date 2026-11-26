/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://app.pagescms.org/zeroslashagency/mahima/',
        permanent: false,
      },
    ];
  },
}

export default nextConfig
