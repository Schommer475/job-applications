// @ts-check
import {defineConfig} from "eslint/config";
import security from "eslint-plugin-security";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default defineConfig(
	security.configs.recommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsParser
		},
		plugins: {
			"@typescript-eslint": tsPlugin
		},
		rules: {
			"security/detect-object-injection": "error"
		}
	}
);