import eslint from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
	...eslintPluginAstro.configs['jsx-a11y-recommended'],
	{
		plugins: {
			'jsx-a11y': jsxA11y,
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-unused-expressions': [
				'error',
				{ allowShortCircuit: false, allowTernary: false },
			],
			'no-console': ['warn', { allow: ['warn', 'error'] }],
		},
	},
	{
		files: ['scripts/**/*.mjs', 'src/integrations/**/*.mjs'],
		languageOptions: {
			globals: globals.node,
		},
		rules: {
			'no-console': 'off',
		},
	},
	{
		ignores: ['dist/**', 'node_modules/**', '.astro/**'],
	},
);
