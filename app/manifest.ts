import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pie Safe — Meal Planning',
    short_name: 'Pie Safe',
    description: "Your family's meal planning hub",
    start_url: '/',
    display: 'standalone',
    background_color: '#ecdcb0',
    theme_color: '#6b5c8a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    share_target: {
      action: '/share-target',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [{ name: 'media', accept: ['image/*'] }],
      },
    },
  }
}
