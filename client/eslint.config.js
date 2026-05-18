import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import {defineConfig, globalIgnores} from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
			stylistic.configs.recommended
		],
		languageOptions: {
			globals: globals.browser,
		},
		plugins: {
			"@stylistic": stylistic
		},
		rules: {
			"@stylistic/quotes": ["error", "double", {
				"avoidEscape": true
			}],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/no-multiple-empty-lines": ["error", {
				"max": 1,
				"maxEOF": 0
			}],
			"@stylistic/comma-dangle": ["error", "never"],
			"@stylistic/arrow-parens": ["error", "as-needed"],
			"@stylistic/max-len": ["warn", {
				"code": 100,
				"ignoreStrings": true,
				"ignoreTemplateLiterals": true,
				"ignoreUrls": true
			}],
			"@stylistic/object-curly-spacing": ["error", "never"],
			"@stylistic/indent": ["error", "tab"],
			"@stylistic/space-before-function-paren": ["error", "always"],
			"@stylistic/eol-last": "off",
			"@stylistic/member-delimiter-style": ["error", {
				"multiline": {
					"delimiter": "comma",
					"requireLast": false
				},
				"singleline": {
					"delimiter": "comma",
					"requireLast": false
				}
			}],
			"@stylistic/no-tabs": ["error", {
				"allowIndentationTabs": true
			}],
			"@stylistic/operator-linebreak": ["error", "after"],
			"@stylistic/indent-binary-ops": ["error", "tab"],
			"@stylistic/jsx-indent-props": ["error", "tab"],
			"@stylistic/brace-style": ["error", "1tbs"],
			"@stylistic/jsx-one-expression-per-line": "off",
			"@typescript-eslint/no-unused-vars": ["error", {
				"ignoreRestSiblings": true
			}]
		}
	}
]);
