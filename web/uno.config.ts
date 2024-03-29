import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['row', 'flex flex-row'],
    ['col', 'flex flex-col'],
    ['limited-w', 'max-w-1200px m-auto p-4 lg:p-8 xl:px-4 xl:py-12'],
    [/^wh-(\d)$/, ([, d]) => `w-${d} h-${d}`],
  ],
  theme: {
    fontFamily: {
      harmony: 'harmony-sans',
    },
  },
  layers: {
    components: -1,
    default: 1,
    primevue: 2,
    utilities: 3,
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
