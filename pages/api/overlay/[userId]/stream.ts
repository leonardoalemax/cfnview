import type { NextApiRequest, NextApiResponse } from "next";
import { getBattlelog } from "../../../../lib/battlelog-server";

export const config = { api: { bodyParser: false, responseLimit: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		res.status(405).end();
		return;
	}

	const userId = String(req.query.userId ?? "");
	if (!userId) {
		res.status(400).end();
		return;
	}

	// SSE headers
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache, no-transform");
	res.setHeader("Connection", "keep-alive");
	res.setHeader("X-Accel-Buffering", "no"); // disable Nginx/proxy buffering
	res.flushHeaders();

	let lastCachedAt = 0;

	const check = async () => {
		try {
			const data = await getBattlelog(userId, true);
			if (data.cachedAt !== lastCachedAt) {
				lastCachedAt = data.cachedAt;
				res.write(`data: ${JSON.stringify({ cachedAt: data.cachedAt })}\n\n`);
			}
		} catch (e) {
			console.error("[overlay/stream] check error:", e);
			res.write(`event: error\ndata: {}\n\n`);
		}
	};

	// Check immediately on connect, then every 60s
	await check();
	const interval = setInterval(check, 60_000);

	// Keepalive ping every 30s to prevent proxy/browser timeouts
	const keepalive = setInterval(() => res.write(": ping\n\n"), 30_000);

	req.on("close", () => {
		clearInterval(interval);
		clearInterval(keepalive);
		res.end();
	});
}
