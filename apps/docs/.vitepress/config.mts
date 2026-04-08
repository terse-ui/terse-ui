import {defineConfig} from 'vitepress';
import {apiRefInject} from './plugins/api-ref-inject';
import {examplesWatcher} from './plugins/examples-watcher';

export default defineConfig({
  lang: 'en-US',
  title: 'Terse UI',
  description:
    'Accessible, unstyled Angular UI primitives. Behavior and accessibility built in. Styling is yours.',

  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', {name: 'theme-color', content: '#0f0f11'}],
    ['link', {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'angular, headless ui, primitives, accessible, unstyled, signals, component library, a11y',
      },
    ],
    ['meta', {property: 'og:type', content: 'website'}],
    ['meta', {property: 'og:title', content: 'Terse UI - Headless UI Primitives for Angular'}],
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
    siteTitle: 'Terse UI',
    logo: '/favicon.svg',
    outline: [2, 3],

    search: {
      provider: 'local',
    },

    nav: [
      {text: 'Guide', link: '/guide/getting-started'},
      {text: 'Protos', link: '/protos'},
      {text: 'Atoms', link: '/atoms'},
      {text: 'Utils', link: '/utils'},
      {text: 'Blog', link: '/blog/ng0309-is-dead'},
      {
        text: 'Links',
        items: [
          {text: 'GitHub', link: 'https://github.com/terse-ui/terse-ui'},
          {text: 'npm', link: 'https://www.npmjs.com/package/@terse-ui/core'},
        ],
      },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          {text: 'Getting Started', link: '/guide/getting-started'},
          {text: 'Why Terse UI?', link: '/guide/why-terse-ui'},
        ],
      },
      {
        text: 'Protos',
        link: '/protos',
        items: [{text: 'Button', link: '/protos/button'}],
      },
      {
        text: 'Atoms',
        link: '/atoms',
        items: [
          {text: 'Id', link: '/atoms/id'},
          {text: 'Hoverable', link: '/atoms/hoverable'},
          {text: 'Anchor', link: '/atoms/anchor'},
          {text: 'Open Close', link: '/atoms/open-close'},
          {text: 'Orientation', link: '/atoms/orientation'},
          {text: 'Interact', link: '/atoms/interact'},
          {text: 'Focus', link: '/atoms/focus'},
          {text: 'Visibility', link: '/atoms/visibility'},
          {text: 'Escape Key', link: '/atoms/escape-key'},
          {text: 'Click Outside', link: '/atoms/click-outside'},
          {text: 'Classes', link: '/atoms/classes'},
          {text: 'Press', link: '/atoms/press'},
          {text: 'Focus Trap', link: '/atoms/focus-trap'},
          {text: 'Roving Focus', link: '/atoms/roving-focus'},
        ],
      },
      {
        text: 'Utils',
        link: '/utils',
        items: [{text: 'Host', link: '/utils/host'}],
      },
      {
        text: 'Roadmap',
        items: [{text: 'Overview', link: '/roadmap'}],
      },
      {
        text: 'Blog',
        items: [{text: 'NG0309 Is Dead', link: '/blog/ng0309-is-dead'}],
      },
    ],

    socialLinks: [{icon: 'github', link: 'https://github.com/terse-ui/terse-ui'}],

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
    languageAlias: {
      'ts': 'angular-ts',
      'html': 'angular-html',
    },
    theme: {
      light: 'github-light',
      dark: 'dark-plus',
    },
  },

  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.startsWith('ex-'),
      },
    },
  },

  vite: {
    // plugins: [tailwind(), examplesWatcher()],
    plugins: [apiRefInject(), examplesWatcher()],
    server: {
      host: process.env.VITEPRESS_HOST || 'localhost',
      watch: {
        ignored: ['!**/public/examples/**'],
      },
    },
  },
});
