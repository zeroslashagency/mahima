import type { MetadataRoute } from 'next'

const baseUrl = 'https://healwithmahima.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const routes = [
    '',
    '/about',
    '/contact',
    '/services',
    '/shop',
    '/play',
    '/sound-healing-delhi-ncr',
    '/breathwork-delhi-ncr',
    '/corporate-wellness-gurgaon',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
