import sql from "../db";
import type { CachedBattlelog } from "../types";

export async function getCached(userId: string): Promise<CachedBattlelog | null> {
	const rows = await sql`
		SELECT replays, banner_info, cached_at
		FROM user_battlelog
		WHERE user_id = ${userId}
	`;

	if (!rows.length) return null;

	const row = rows[0];
	return {
		replays: row.replays,
		bannerInfo: row.banner_info ?? undefined,
		cachedAt: Number(row.cached_at),
	};
}

export async function saveCached(userId: string, payload: CachedBattlelog): Promise<void> {
	await sql`
		INSERT INTO user_battlelog (user_id, replays, banner_info, cached_at)
		VALUES (
			${userId},
			${sql.json(JSON.parse(JSON.stringify(payload.replays)))},
			${payload.bannerInfo ? sql.json(JSON.parse(JSON.stringify(payload.bannerInfo))) : null},
			${payload.cachedAt}
		)
		ON CONFLICT (user_id) DO UPDATE SET
			replays     = EXCLUDED.replays,
			banner_info = EXCLUDED.banner_info,
			cached_at   = EXCLUDED.cached_at
	`;
}
