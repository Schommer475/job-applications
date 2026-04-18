import {readdir, readFile} from "node:fs/promises";
import {dirname, resolve, join} from "node:path";
import {fileURLToPath} from "node:url";
import postgres from "postgres";

const directory = dirname(fileURLToPath(import.meta.url)),
	sqlDirectory = resolve(join(directory, "..", "sql")),
	databaseURL = process.env.DATABASE_URL as string,
	datasource = postgres(databaseURL);

await datasource.begin(async sql => {
	for (const sqlText of await getMigrationSql()) {
		await sql.unsafe(sqlText);
	}
});


await datasource.end();


async function getMigrationSql () {
	const fileNames = await readdir(sqlDirectory);

	return await Promise.all(fileNames.sort().map(fileName => readFile(join(sqlDirectory, fileName), {
		encoding: "utf-8"
	})));
}