import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

const background = '#1E4C5C'

// Generates the PWA icons in /public from public/favicon.svg.
// Run `npm run generate-pwa-assets` after changing the logo.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      resizeOptions: { background },
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: { background },
    },
  },
  images: ['public/favicon.svg'],
})
