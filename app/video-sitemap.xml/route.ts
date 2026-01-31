const baseUrl = 'https://healwithmahima.in'

const videos = [
  {
    page: '/',
    content: '/asset/vid-1.mp4',
    title: 'Sound bath in motion',
    description: 'Immersive sound healing session highlights.',
    thumbnail: '/asset/hero-poster.webp',
  },
  {
    page: '/',
    content: '/asset/vid-2.mp4',
    title: 'Breathwork flow',
    description: 'Guided breathwork and calm movement.',
    thumbnail: '/asset/hero-poster.webp',
  },
  {
    page: '/',
    content: '/asset/vid-3.mp4',
    title: 'Meditation space ambience',
    description: 'Meditation space ambience and soundscape.',
    thumbnail: '/asset/hero-poster.webp',
  },
]

export async function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${videos
    .map(
      (video) => `
  <url>
    <loc>${baseUrl}${video.page}</loc>
    <video:video>
      <video:content_loc>${baseUrl}${video.content}</video:content_loc>
      <video:title>${video.title}</video:title>
      <video:description>${video.description}</video:description>
      <video:thumbnail_loc>${baseUrl}${video.thumbnail}</video:thumbnail_loc>
    </video:video>
  </url>`,
    )
    .join('')}
</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
