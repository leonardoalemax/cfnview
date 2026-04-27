import type { NextApiRequest, NextApiResponse } from "next";
import { getBattlelog } from "../../../lib/battlelog-server";
import type { CachedBattlelog } from "../../../lib/types";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<CachedBattlelog | { error: string }>,
) {
	if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

	const userId = String(req.query.userId ?? "");
	if (!userId) return res.status(400).json({ error: "userId required" });

	try {
		// Always bypass TTL — overlay always wants the freshest data
		const data = await getBattlelog(userId, true);
		res.setHeader("Cache-Control", "no-store");
		return res.status(200).json(data);
	} catch (err) {
		console.error("[overlay]", err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
