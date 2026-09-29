import js from "@eslint/js"
import prettier from "eslint-config-prettier"
import jsxA11y from "eslint-plugin-jsx-a11y"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

// Follows shadcn/ui (apps/v4/eslint.config.mjs): the Next.js core-web-vitals
// rules plus typescript-eslint, with inline type imports. This is a Vite app,
// so it loads the React, React Hooks, and jsx-a11y plugins that the Next.js
// preset bundles. It uses the full jsx-a11y recommended set, not the Next.js
// subset, because accessibility is a hard requirement here.
export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "public/r/**", ".vercel/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // The same overrides as shadcn/ui.
      "react-hooks/incompatible-library": "off",
      "react-hooks/purity": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // TypeScript checks props. TypeScript also reports unused locals.
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.mjs", "*.config.{js,ts}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier
)
