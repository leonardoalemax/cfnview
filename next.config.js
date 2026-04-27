// Force Node.js DNS to prefer IPv4 (prevents ENETUNREACH in Docker with IPv6-only resolution)
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

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
