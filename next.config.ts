import type { NextConfig } from 'next';

// /portfolio 등 저장소 하위 경로에 배포할 때만 설정합니다.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

if (basePath && (!basePath.startsWith('/') || basePath.endsWith('/'))) {
  throw new Error('NEXT_PUBLIC_BASE_PATH must start with / and have no trailing slash.');
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
