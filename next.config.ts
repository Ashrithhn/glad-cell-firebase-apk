
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Make Razorpay Key ID available on the client-side
  // Ensure NEXT_PUBLIC_RAZORPAY_KEY_ID is set in your environment (.env.local)
  env: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  },
};

export default nextConfig;
