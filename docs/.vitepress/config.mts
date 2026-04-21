import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "IMAGINER API DOCS",
  description: "Imaginer RESTful API Documentation",
  cleanUrls: true,
  appearance: true, // Enables dark/light mode
  themeConfig: {
    outline: {
      level: [2, 3],
      label: 'On this page'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/api-reference' },
      { text: 'Pricing', link: '/pricing' }
    ],

    sidebar: [
      {
        text: 'API Documentation',
        items: [
          { text: 'Overview', link: '/api-reference' },
          { text: 'Pricing & Limits', link: '/pricing' }
        ]
      }
    ],

    search: {
      provider: 'local'
    }
  }
})
