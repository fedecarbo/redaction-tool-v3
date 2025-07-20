/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configure for PDF.js
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      }
      
      // Handle .mjs files
      config.module.rules.push({
        test: /\.mjs$/,
        type: 'javascript/auto',
      })
    }
    return config
  },
}

module.exports = nextConfig 