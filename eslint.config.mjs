import eslintConfig from "@antfu/eslint-config"
import nuxtConfig from "./.nuxt/eslint.config.mjs"

export default eslintConfig(
  {
    typescript: true,
    vue: true,
    stylistic: {
      indent: 2,
      quotes: "double"
    },
    rules: {
      curly: "off",
      "no-console": "off",
      "no-new-func": "off",
      "style/semi": ["error", "never"],
      "style/indent": ["error", 2],
      "style/quote-props": ["warn", "as-needed"],
      "style/comma-dangle": ["warn", "never"],
      "style/brace-style": ["warn", "1tbs"],
      "style/arrow-parens": ["error", "always"],
      "vue/block-order": ["error", {
        order: ["script", "template", "style"]
      }],
      "vue/script-indent": ["error", 2, { baseIndent: 0 }],
      "vue/comma-dangle": ["warn", "never"],
      eqeqeq: "off",
      "vue/eqeqeq": "off",
      "ts/no-use-before-define": "off",
      "no-alert": "off",
      "unicorn/prefer-number-properties": "off",
      "antfu/top-level-function": "off",
      "antfu/if-newline": "off",
      "new-cap": "off",
      "node/prefer-global/process": ["off"]
    }
  },

  {
    files: ["**/*.vue"],
    rules: {
      "style/indent": "off",
      "vue/html-indent": ["error", 2]
    }
  },

  nuxtConfig()
)
