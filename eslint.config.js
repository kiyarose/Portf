import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const reactHooksConfig = reactHooks.configs.flat['recommended-latest']
const reactRefreshConfig = reactRefresh.configs.vite

const reactTsConfig = {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      ...(reactHooksConfig.languageOptions?.globals ?? {}),
      ...(reactRefreshConfig.languageOptions?.globals ?? {})
    },
    parser:
      reactHooksConfig.languageOptions?.parser ??
      reactRefreshConfig.languageOptions?.parser,
    parserOptions: {
      ...(reactHooksConfig.languageOptions?.parserOptions ?? {}),
      ...(reactRefreshConfig.languageOptions?.parserOptions ?? {})
    }
  },
  plugins: {
    ...(reactHooksConfig.plugins ?? {}),
    ...(reactRefreshConfig.plugins ?? {})
  },
  rules: {
    ...(reactHooksConfig.rules ?? {}),
    ...(reactRefreshConfig.rules ?? {})
  },
  settings: {
    ...(reactHooksConfig.settings ?? {}),
    ...(reactRefreshConfig.settings ?? {})
  }
}

const tsRecommended = Array.isArray(tseslint.configs.recommended)
  ? tseslint.configs.recommended
  : [tseslint.configs.recommended]

const nodeConfig = {
  files: [
    '.lighthouserc.{js,cjs}',
    'src/tools/**/*.{js,cjs,mjs}',
    'scripts/**/*.{js,cjs,mjs}'
  ], // Support both .js and .cjs
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.node
    }
  }
}

export default [
  {
    ignores: ['dist']
  },
  nodeConfig,
  js.configs.recommended,
  ...tsRecommended,
  reactTsConfig
]
