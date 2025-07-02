import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

// อ่าน env ที่ต้องใช้
const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const MEDIA_DOMAIN = process.env.NEXT_PUBLIC_MEDIA_DOMAIN || "localhost";

// สร้าง remotePatterns อัตโนมัติ
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
  // ถ้ามี domain อื่นให้เพิ่มแบบนี้
  // {
  //   protocol: "https",
  //   hostname: "another-domain.com",
  //   pathname: "/media/**",
  // },
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
  },
  allowedDevOrigins,
};

export default withFlowbiteReact(nextConfig);