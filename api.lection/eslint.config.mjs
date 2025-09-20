"use strict";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.browser },
        rules: {
            quotes: ["error", "sigle"],
            semi: ["error", "always"],
            "comma-dangle": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
            "space-before-function-paren": ["error", "never"],
            "arrow-spacing": ["error", { before: true, after: true }],
            "key-spacing": ["error", { beforeColon: false, afterColon: true }],
            "no-multiple-empty-lines": ["error", { max: 1 }],
            "eol-last": ["error", "always"],
            eqeqeq: ["error", "always"],
            curly: ["error", "all"],
            "no-duplicate-imports": "error",
            "no-console": "warn",
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    "selector": "interface",
                    "format": ["PascalCase"],
                    "custom": {
                        "regex": "^I[A-Z]",
                        "match": true,
                    },
                },
            ],
        },
    },
    tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-namespace": "off",
        },
    },
]);
