import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	turbopack: {
		resolveAlias: {
			'@shared': './shared/src',
		},
	},
};

export default nextConfig;
