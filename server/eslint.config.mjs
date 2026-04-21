// @ts-check
import {defineConfig} from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import {dirname} from "node:path";
import {fileURLToPath} from "node:url";

export default defineConfig(
	js.configs.recommended,
	tseslint.configs.recommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.eslint.json"],
				tsconfigRootDir: dirname(fileURLToPath(import.meta.url)),
			},
		},
		rules: {
			"prefer-const": ["warn", {
				"ignoreReadBeforeAssign": true
			}],
			"quotes": ["error", "double", {
				"avoidEscape": true
			}]
		}
	}
);