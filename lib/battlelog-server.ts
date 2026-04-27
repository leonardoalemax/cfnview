import { getCached, saveCached } from "./repositories/battlelog-repository";
import { fetchFirstPage, fetchRemainingPages } from "./sf6/client";
import type { CachedBattlelog, SF6Replay } from "./types";

// How long to serve the Postgres cache without hitting the SF6 API (ms)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getBattlelog(userId: string, bypassTTL = false): Promise<CachedBattlelog> {
	const cached = await getCached(userId);

	// Serve cache directly if it's fresh enough — skip SF6 API entirely
	if (!bypassTTL && cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
		console.log(`[battlelog] Cache fresh for ${userId}, serving from DB.`);
		return cached;
	}

	const existingReplays: SF6Replay[] = cached?.replays ?? [];

	// Cache stale or missing — fetch page 1 to check for new replays
	const { page1Replays, totalPages, bannerInfo } = await fetchFirstPage(userId);

	// If nothing is new, bump cachedAt and return
	const cachedIds = new Set(existingReplays.map((r) => r.replay_id));
	const hasNew = page1Replays.some((r) => !cachedIds.has(r.replay_id));

	if (!hasNew && existingReplays.length) {
		console.log(`[battlelog] No new replays for ${userId}, refreshing timestamp.`);
		const refreshed: CachedBattlelog = { ...cached!, cachedAt: Date.now() };
		await saveCached(userId, refreshed);
		return refreshed;
	}

	// New replays detected — fetch remaining pages in parallel
	const rest = await fetchRemainingPages(userId, totalPages);
	const freshReplays = [...page1Replays, ...rest];

	// Merge: fresh takes precedence, existing fills historical gaps
	const merged = new Map<string, SF6Replay>();
	for (const r of existingReplays) merged.set(r.replay_id, r);
	for (const r of freshReplays) merged.set(r.replay_id, r);

	const replays = Array.from(merged.values()).sort((a, b) => b.uploaded_at - a.uploaded_at);

	const payload: CachedBattlelog = { replays, cachedAt: Date.now(), bannerInfo };
	await saveCached(userId, payload);
	return payload;
}
