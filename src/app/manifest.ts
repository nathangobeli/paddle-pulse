import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Paddle Pulse',
    short_name: 'Paddle Pulse',
    description: 'Live paddle boarding conditions and weather dashboard',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Slate 900
    theme_color: '#10b981', // Seafoam Green-ish
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
