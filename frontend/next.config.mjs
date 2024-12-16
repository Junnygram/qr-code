// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy',
        destination: 'http://backend-service/generate-qr/',
      },
      {
        source: '/api/proxy-image',
        destination: 'http://backend-service/generate-qr-image/',
      },
    ];
  },
};

export default nextConfig;
