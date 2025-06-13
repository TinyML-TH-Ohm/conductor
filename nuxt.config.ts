// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],
  ssr: false,
  devtools: {
    enabled: false,
  },
  app: {
    head: {
      title: 'Orchestra Conductor',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', href: import.meta.dev ? 'favicon.ico' : `${import.meta.env.NUXT_APP_BASE_URL}/favicon.ico` },
      ],
      htmlAttrs: {
        lang: 'en',
      },
    },
  },
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-05-01',
  eslint: {
    config: {
      standalone: false,
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },
})
