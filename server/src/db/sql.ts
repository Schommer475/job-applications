import postgres from "postgres";
import prexit from "prexit";

const databaseURL = process.env.DATABASE_URL as string,
	sql = postgres(databaseURL, {
		transform: {
			undefined: null
		}
	});

export default sql;

prexit(async () => {
	await sql.end();
});