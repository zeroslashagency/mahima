import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: [
      'https://healwithmahima.in/sitemap.xml',
      'https://healwithmahima.in/video-sitemap.xml',
    ],
  }
}
