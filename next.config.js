/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net', /*DALL-E*/
        port: '',
        pathname: '/private/**'
      }
    ]
  }
}

module.exports = nextConfig
