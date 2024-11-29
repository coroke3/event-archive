/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [
      "i.gyazo.com",
      "lh3.googleusercontent.com",
      "i.ytimg.com",
      "img.youtube.com",
      "i.gyazo.com",
      "drive.google.com",
      "pbs.twimg.com",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("async_hooks"); // async_hooks を外部モジュールとして設定
    }
    return config;
  },
};

module.exports = nextConfig;
