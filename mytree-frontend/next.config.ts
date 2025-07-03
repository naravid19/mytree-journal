import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

// อ่าน env ที่ต้องใช้
const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const MEDIA_DOMAIN = process.env.NEXT_PUBLIC_MEDIA_DOMAIN || "localhost";

// สร้าง remotePatterns อัตโนมัติจาก env
const remotePatterns: RemotePattern[] = [
  {
    protocol: "http",
    hostname: MEDIA_DOMAIN,
    pathname: "/media/**",
  },
  {
    protocol: "https",
    hostname: MEDIA_DOMAIN,
    pathname: "/media/**",
  },
  // เพิ่ม localhost patterns สำหรับ development
  {
    protocol: "http",
    hostname: "localhost",
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    pathname: "/media/**",
  },
];

// อนุญาต cross-origin ทุกกรณีที่ใช้งานจริง (prod/dev)
const allowedDevOrigins = [
  FRONTEND_ORIGIN,
  API_BASE,
  `https://${MEDIA_DOMAIN}`,
  `http://${MEDIA_DOMAIN}`,
  "http://localhost:3000",
  "http://localhost:8000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:8000",
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    // เพิ่ม image optimization settings
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  allowedDevOrigins,
  // เพิ่ม experimental settings สำหรับ image optimization
  experimental: {
    optimizeCss: true,
  },
};

export default withFlowbiteReact(nextConfig);