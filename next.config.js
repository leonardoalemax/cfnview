/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.streetfighter.com",
			},
		],
	},
};

module.exports = nextConfig;
