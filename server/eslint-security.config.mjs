// @ts-check
import {defineConfig} from "eslint/config";
import security from "eslint-plugin-security";

export default defineConfig(
    security.configs.recommended,
    {
		files: ["**/*.ts"]
    }
);