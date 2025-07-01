import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

// env for production
const frontendOrigin = process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000";
const backendOrigin = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const backendHost = new URL(backendOrigin).hostname;

const remotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: backendHost,
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: backendHost,
    pathname: "/media/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/media/**",
  },
];

const nextConfig: NextConfig = {
  images: { remotePatterns },
  // **จุดสำคัญ**
  allowedDevOrigins: [
    frontendOrigin,
    backendOrigin,
    "http://localhost:3000", // dev local
    "http://localhost:8000", // dev local
  ],
};

export default withFlowbiteReact(nextConfig);