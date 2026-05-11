import { defineConfig, globalIgnores } from 'eslint/config'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'
import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginPrettier from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'public/*', 'src/assets/**']),
  // Global Config
  {
    ...js.configs.recommended,
    languageOptions: {
      globals: {
        // types/index.d.ts
        RefType: 'readonly',
        EmitType: 'readonly',
        TargetContext: 'readonly',
        ComponentRef: 'readonly',
        ElRef: 'readonly',
        ForDataType: 'readonly',
        AnyFunction: 'readonly',
        PropType: 'readonly',
        Writable: 'readonly',
        Nullable: 'readonly',
        NonNullable: 'readonly',
        Recordable: 'readonly',
        ReadonlyRecordable: 'readonly',
        Indexable: 'readonly',
        DeepPartial: 'readonly',
        Without: 'readonly',
        Exclusive: 'readonly',
        TimeoutHandle: 'readonly',
        IntervalHandle: 'readonly',
        Effect: 'readonly',
        ChangeEvent: 'readonly',
        WheelEvent: 'readonly',
        ImportMetaEnv: 'readonly',
        Fn: 'readonly',
        PromiseFn: 'readonly',
        ComponentElRef: 'readonly',
        parseInt: 'readonly',
        parseFloat: 'readonly'
      }
    },
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      // eslint rules reference https://eslint.org/docs/latest/rules
      ...configPrettier.rules,
      ...pluginPrettier.configs.recommended.rules,
      'no-debugger': 'off',
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'arrow-body-style': ['error', 'as-needed'],
      curly: ['error', 'all'], // if case must add {}
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: false,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true
        }
      ],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var']
        }
      ],
      'no-else-return': ['error', { allowElseIf: false }],
      eqeqeq: ['error', 'always'],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'lf',
          singleAttributePerLine: true
        }
      ]
    }
  },
  // TypeScript Config
  ...tseslint.config({
    extends: [...tseslint.configs.recommended],
    files: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
    rules: {
      '@typescript-eslint/no-redeclare': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' }
      ],
      '@typescript-eslint/prefer-literal-enum-member': [
        'error',
        { allowBitwiseExpressions: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  }),
  {
    files: ['**/*.d.ts'],
    rules: {
      'eslint-comments/no-unlimited-disable': 'off',
      'import/no-duplicates': 'off',
      'no-restricted-syntax': 'off',
      'unused-imports/no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.?([cm])js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    settings: {
      react: {
        version: '19'
      }
    }
  }
])
