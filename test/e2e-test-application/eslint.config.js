// @ts-check
const eslint = require("@eslint/js");
const stylistic = require("@stylistic/eslint-plugin");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      stylistic.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      '@stylistic': stylistic
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/component-selector": [
        "error",
        {
          "type": "element",
          "prefix": "app",
          "style": "kebab-case"
        }
      ],
      "@angular-eslint/directive-class-suffix": "error",
      "@angular-eslint/directive-selector": [
        "error",
        {
          "type": "attribute",
          "prefix": "app",
          "style": "camelCase"
        }
      ],
      "@angular-eslint/no-empty-lifecycle-method": "off",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/prefer-inject": "off",
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/use-pipe-transform-interface": "error",
      "@stylistic/arrow-parens": "off",
      "@stylistic/comma-dangle": "off",
      "@stylistic/indent": ["error", 2],
      "@stylistic/member-delimiter-style": [
        "error",
        {
          "multiline": {
            "delimiter": "semi",
            "requireLast": true
          },
          "singleline": {
            "delimiter": "semi",
            "requireLast": false
          }
        }
      ],
      "@stylistic/quotes": [
        "error",
        "single"
      ],
      "@stylistic/semi": [
        "error",
        "always"
      ],
      "@stylistic/operator-linebreak": "off",
      "@stylistic/lines-between-class-members": "off",
      "@stylistic/space-before-function-paren": "off",
      "@stylistic/type-annotation-spacing": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/explicit-member-accessibility": [
        "off",
        {
          "accessibility": "explicit"
        }
      ],
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "variable",
          "format": [
            "camelCase",
            "UPPER_CASE"
          ],
          "leadingUnderscore": "forbid",
          "trailingUnderscore": "forbid"
        }
      ],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-shadow": "off",
      "@typescript-eslint/no-wrapper-object-types": "off",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/no-use-before-define": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/unified-signatures": "error",
      "arrow-body-style": "off",
      "brace-style": [
        "error",
        "1tbs"
      ],
      "constructor-super": "error",
      "curly": "error",
      "dot-notation": "off",
      "eol-last": "error",
      "eqeqeq": [
        "error",
        "smart"
      ],
      "guard-for-in": "error",
      "id-denylist": "off",
      "id-match": "off",
      "indent": "off",
      "max-len": [
        "error",
        {
          "code": 150
        }
      ],
      "no-bitwise": "error",
      "no-caller": "error",
      "no-console": "off",
      "no-debugger": "error",
      "no-empty": "off",
      "no-empty-function": "off",
      "no-extra-boolean-cast": "off",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-new-wrappers": "error",
      "no-restricted-imports": [
        "error",
        "rxjs/Rx"
      ],
      "no-shadow": "off",
      "no-throw-literal": "error",
      "no-trailing-spaces": "error",
      "no-undef-init": "error",
      "no-underscore-dangle": "off",
      "no-unused-expressions": "off",
      "no-unused-labels": "error",
      "no-use-before-define": "off",
      "no-var": "error",
      "prefer-const": "off",
      "quotes": "off",
      "radix": "error",
      "semi": "off",
      "spaced-comment": [
        "error",
        "always",
        {
          "markers": [
            "/"
          ]
        }
      ],
      "valid-typeof": "error"
    }
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/elements-content": "off",
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
      "@angular-eslint/template/label-has-associated-control": "off"
    },
  }
);
