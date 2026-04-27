import dns from "dns";
import postgres from "postgres";

// Force IPv4 for all DNS lookups in this process.
// Docker containers often receive AAAA (IPv6) records but cannot route IPv6,
// causing ENETUNREACH. This must be called before any network connection.
dns.setDefaultResultOrder("ipv4first");

const sql = postgres(process.env.DATABASE_URL!, {
	ssl: { rejectUnauthorized: false },
	max: 5,
	idle_timeout: 20,
});

export default sql;
