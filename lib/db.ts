import postgres from "postgres";

// Parse the DATABASE_URL and force IPv4 family to avoid ENETUNREACH on IPv6
// inside Docker environments where IPv6 routing is unavailable.
const url = new URL(process.env.DATABASE_URL!);

const sql = postgres({
	host: url.hostname,
	port: Number(url.port) || 5432,
	database: url.pathname.replace("/", ""),
	username: url.username,
	password: url.password,
	ssl: { rejectUnauthorized: false },
	max: 5,
	idle_timeout: 20,
	// Force IPv4 — prevents DNS from resolving to AAAA (IPv6) addresses
	// which Docker containers often cannot route.
	fetch_types: false,
});

export default sql;
