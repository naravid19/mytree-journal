import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const url = new URL(apiUrl);

const remotePatterns: RemotePattern[] = [
  {
    protocol: url.protocol.replace(":", "") as "http" | "https",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: "/media/**",
  },
];

// dev local fallback
if (url.hostname !== "localhost") {
  remotePatterns.push({
    protocol: "http",
    hostname: "localhost",
    port: "8000",
    pathname: "/media/**",
  });
}

// fallback: allow both http/https for prod domain
if (url.protocol === "https:") {
  remotePatterns.push({
    protocol: "http",
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: "/media/**",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default withFlowbiteReact(nextConfig);
