import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages ? "/Chiem-Tinh-Ung-Dung" : "";

const nextConfig: NextConfig = {
  // GitHub Pages can serve only static files. Keep local development at `/`,
  // while publishing the production export below the repository path.
  output: "export",
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
