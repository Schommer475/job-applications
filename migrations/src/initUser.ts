import postgres from "postgres";
import bcrypt from "bcrypt";

const {SERVICE_USER: username, PASSWORD, DATABASE_URL} = process.env,
	saltRounds = 10,
	sql = postgres(DATABASE_URL as string),
	user = {
		username,
		password: await bcrypt.hash(PASSWORD as string, saltRounds)
	};

await sql`
	INSERT INTO users ${sql(user, "username", "password")}
`;

await sql.end();
