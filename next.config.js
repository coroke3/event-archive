/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
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
};
