const SF6_BASE = "https://www.streetfighter.com/6/buckler/assets/images";

// ─── Image helpers ────────────────────────────────────────────────────────────

export function characterImg(toolName: string, side: "l" | "r"): string {
	return `${SF6_BASE}/material/character/character_${toolName}_${side}.png`;
}

export function characterFace(
	toolName: string,
	face: "1" | "2" | "3" | "4" | "5",
): string {
	return `${SF6_BASE}/praise/fighter/${toolName}/face${face}.png`;
}

export function rankImg(gradeId: number): string {
	return `${SF6_BASE}/material/rank/rank${gradeId}_s.png`;
}

export function platformImg(toolName: string): string {
	return `${SF6_BASE}/common/icon_${toolName}.png`;
}

export function controlImg(inputType: number): string {
	return `${SF6_BASE}/common/icon_controltype${inputType}.png`;
}

export const VS_IMG = `${SF6_BASE}/profile/icon_versus.png`;

// ─── SF6 API types (raw from buckler) ────────────────────────────────────────

export interface SF6PlayerRef {
	fighter_id: string;
	platform_id: number;
	short_id: number;
	platform_name: string;
	platform_tool_name: string;
}

export interface SF6PlayerInfo {
	player: SF6PlayerRef;
	character_id: number;
	playing_character_id: number;
	character_name: string;
	character_tool_name: string;
	playing_character_name: string;
	playing_character_tool_name: string;
	league_point: number;
	league_rank: number;
	battle_input_type: number;
	battle_input_type_name: string;
	round_results: number[];
	allow_cross_play: boolean;
}

export interface SF6Replay {
	replay_id: string;
	uploaded_at: number; // Unix timestamp (seconds)
	player1_info: SF6PlayerInfo;
	player2_info: SF6PlayerInfo;
	views: number;
	replay_battle_type: number;
	replay_battle_type_name: string;
	replay_battle_sub_type_name: string;
}

export interface SF6FighterBannerInfo {
	personal_info: {
		fighter_id: string;
		short_id: number;
		platform_name: string;
		platform_tool_name: string;
	};
	favorite_character_name: string;
	favorite_character_alpha: string;
	favorite_character_tool_name: string;
	favorite_character_league_info: {
		league_point: number;
		league_rank: number;
		league_rank_info: {
			league_rank_name: string;
		};
	};
	favorite_character_play_point: {
		fighting_ground: number;
		world_tour: number;
		battle_hub: number;
	};
	title_data: {
		title_data_plate_name: string;
		title_data_val: string;
	};
	profile_comment: {
		profile_tag_name: string;
	};
}

export interface SF6BattlelogResponse {
	pageProps: {
		replay_list: SF6Replay[];
		current_page: number;
		total_page: number;
		sid: number;
		fighter_banner_info: SF6FighterBannerInfo;
	};
}

// ─── Derived winner ───────────────────────────────────────────────────────────

// round_results: 0 = loss/not played, any positive value = round won (KO, timeout, chip, etc.)
export function getWinner(replay: SF6Replay): 1 | 2 {
	const p1wins = replay.player1_info.round_results.filter((r) => r > 0).length;
	const p2wins = replay.player2_info.round_results.filter((r) => r > 0).length;
	return p1wins > p2wins ? 1 : 2;
}

// ─── Computed stat responses ──────────────────────────────────────────────────

export interface WinLossStat {
	wins: number;
	losses: number;
	total: number;
	win_pct: number;
}

export interface CharStat {
	name: string;
	tool_name: string;
	total: number;
	wins: number;
	losses: number;
	clean_losses: number;
	close_losses: number;
	win_rate: number;
	priority_score: number;
}

export interface CalendarStat {
	by_day: Record<string, { wins: number; total: number }>;
	by_weekday: Array<{ wins: number; total: number }>;
}

// ─── Paginated replays response ──────────────────────────────────────────────

export interface ReplayPage {
	replays: SF6Replay[];
	total: number;
	page: number;
	total_pages: number;
}

// ─── Player search index ─────────────────────────────────────────────────────

export interface PlayerEntry {
	fighter_id: string;
	short_id: number;
	character_tool_name: string;
	updated_at: number;
}

// ─── Fighting stats (matchup win rates) ──────────────────────────────────────

export interface FightingOpponentHeader {
	id: number;
	name_alpha: string;
	tool_name: string;
	input_type: string;
}

export interface FightingValue {
	oid: number;
	val: string;
	sf: number;
}

export interface FightingRecord {
	id: number;
	name_alpha: string;
	tool_name: string;
	input_type: string;
	total: string;
	win_rate: number;
	values: FightingValue[];
}

export interface LeagueFighting {
	league_rank: number;
	opponent_header: FightingOpponentHeader[];
	records: FightingRecord[];
}

export interface FightingSnapshot {
	yyyymm: string;
	leagues: LeagueFighting[];
	cached_at: number;
}

// ─── Character usage ─────────────────────────────────────────────────────────

export interface CharUsageEntry {
	character_tool_name: string;
	character_alpha: string;
	play_rate: number;
	previous_rate: number;
}

export interface LeagueUsage {
	operation_type: number;
	league_rank: number;
	league_alpha: string;
	entries: CharUsageEntry[];
}

export interface UsageSnapshot {
	yyyymm: string;
	leagues: LeagueUsage[];
	cached_at: number;
}

// ─── Hourly stats ────────────────────────────────────────────────────────────

export interface HourStat {
	hour: number;
	wins: number;
	total: number;
}

export interface HourlyStats {
	hours: HourStat[];
}

// ─── LP history ──────────────────────────────────────────────────────────────

export interface LPEntry {
	date: string; // YYYY-MM-DD
	lp: number;
}

export interface LPHistory {
	entries: LPEntry[];
}

// ─── Cache payload (stored in Firestore) ─────────────────────────────────────

export interface CharacterOption {
	tool_name: string;
	name: string;
}

export interface CharacterRankStat {
	name: string;
	tool_name: string;
	lp: number;
	league_rank: number;
}

export interface CachedBattlelog {
	replays: SF6Replay[];
	cachedAt: number;
	bannerInfo?: SF6FighterBannerInfo;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export interface CountryPlayerCount {
	home_id: number;
	country_name: string;
	iso3: string;
	player_count: number;
}
