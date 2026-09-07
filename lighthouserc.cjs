/** @type {import('@lhci/cli').LHCI.ServerCommand.Options} */
module.exports = {
	ci: {
		collect: {
			url: ['http://127.0.0.1:4321/', 'http://127.0.0.1:4321/blog'],
			startServerCommand: 'pnpm preview --host 127.0.0.1 --port 4321',
			startServerReadyPattern: '4321',
			numberOfRuns: 1,
			settings: {
				preset: 'desktop',
			},
		},
		assert: {
			assertions: {
				'categories:performance': ['warn', { minScore: 0.65 }],
				'categories:accessibility': ['error', { minScore: 0.9 }],
				'categories:best-practices': ['warn', { minScore: 0.85 }],
				'categories:seo': ['error', { minScore: 0.9 }],
				'cumulative-layout-shift': ['warn', { maxNumericValue: 0.15 }],
				'largest-contentful-paint': ['warn', { maxNumericValue: 4500 }],
				'total-blocking-time': ['warn', { maxNumericValue: 600 }],
				'resource-summary:script:size': ['warn', { maxNumericValue: 350000 }],
				'resource-summary:stylesheet:size': [
					'warn',
					{ maxNumericValue: 90000 },
				],
			},
		},
		upload: {
			target: 'temporary-public-storage',
		},
	},
};
