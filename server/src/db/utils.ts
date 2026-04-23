export async function transformCase<T extends object> (promise: Promise<T[]>|T[]): Promise<CamelCased<T>[]> {
	const rows = await promise;

	return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => {
		return [toCamelCase(key), value];
	}))) as CamelCased<T>[];
}

export function structure<T extends object> (rows: T[]): Structured<T>[] {
	return rows.map(toStructured);
}

function toCamelCase<T extends string> (key: T): CamelCase<T> {
	const [firstPart, ...otherParts] = key.split("_");

	return otherParts.reduce((joined: string, part: string) => {
		return joined + part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
	}, firstPart.toLowerCase()) as CamelCase<T>;
}

function toStructured<T extends object> (row: T): Structured<T> {
	const nestedKeys = new Set<string>(),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		structured: any = {};

	/* eslint-disable security/detect-object-injection */
	for (const [key, value] of (Object.entries(row))) {
		const [first, ...remaining] = key.split(":");

		if (remaining.length) {
			nestedKeys.add(first);
			structured[first] ??= {};
			structured[first][remaining.join(":")] = value;
		} else {
			structured[first] = value;
		}
	}

	for (const key of nestedKeys) {
		structured[key] = collapse(toStructured(structured[key]));
	}
	/* eslint-enable security/detect-object-injection */

	return structured as Structured<T>;
}

function collapse<T extends object> (record: T): Collapsed<T> {
	let collapsed: T|null = record;

	if (Object.values(record).every(value => value === null)) {
		collapsed = null;
	}

	return collapsed as Collapsed<T>;
}

// Type definitions

// casing types
type CamelCased<T> = {
	[K in keyof T & string as CamelCase<K>]: T[K]
};

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}`
  ? `${Lowercase<P1>}${PascalCase<P2>}`
  : Lowercase<S>;

type PascalCase<S extends string> = S extends `${infer P1}_${infer P2}`
	? `${Capitalize<Lowercase<P1>>}${PascalCase<P2>}`
	: Capitalize<Lowercase<S>>

// structuring types
type Structured<T> =
	{ [K in PlainKeys<T>]: T[K] }
	&
	{ [P in Prefix<GroupedKeys<T>>]: Collapsed<Structured<{
		[K in GroupedKeys<T> as K extends `${P}:${infer S}` ? S : never]: T[K]
		}>>
	};

type PlainKeys<T> = {
  [K in keyof T & string]: K extends `${string}:${string}` ? never : K
}[keyof T & string];

type GroupedKeys<T> = {
  [K in keyof T & string]: K extends `${string}:${string}` ? K : never
}[keyof T & string];

type Prefix<K extends string> = K extends `${infer P}:${string}` ? P : never;

type AllNullable<T> = {
  [K in keyof T]: null extends T[K] ? never : true
}[keyof T] extends never ? true : false;

type Collapsed<T> =
  [T[keyof T]] extends [null] ? null
  : AllNullable<T> extends true ? T | null
  : T;