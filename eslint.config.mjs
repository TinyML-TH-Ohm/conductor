// @ts-check
import antfu from '@antfu/eslint-config'
import nuxt from './.nuxt/eslint.config.mjs'

export default nuxt(
  antfu(
    {
      formatters: true,
      rules: {
        'no-console': 'off',
      },
      ignores: [
        'arduino_command/**',
        'arduino_instrument/**',
        'python_command/**',
        'python_instrument/**',
        'old/**',
      ],
    },
  ),
)
