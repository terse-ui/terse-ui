import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'Terse UI',
  description:
    'Accessible, unstyled Angular UI primitives. Behavior and accessibility built in. Styling is yours.',

  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#0f0f11' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'angular, headless ui, primitives, accessible, unstyled, signals, component library, a11y',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Terse UI - Headless UI Primitives for Angular' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Accessible, unstyled Angular UI primitives. Behavior and accessibility built in. Styling is yours.',
      },
    ],
  ],

  themeConfig: {
    outline: [2, 3],

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Components', link: '/components/hover' },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/terse-ui/terse-ui' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@terse-ui/core' },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [{ text: 'Getting Started', link: '/' }],
      },
      {
        text: 'Components',
        items: [{ text: 'Hover', link: '/components/hover' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/terse-ui/terse-ui' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright \u00A9 2024-present Terse UI',
    },

    editLink: {
      pattern: 'https://github.com/terse-ui/terse-ui/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  markdown: {
    theme: {
      light: 'github-dark',
      dark: 'github-dark',
    },
  },
});
