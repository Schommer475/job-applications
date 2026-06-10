const timePattern = /^\s*((?:0?[1-9])|(?:1[0-2]))\s*:\s*([0-5]\d)\s*([aApP])\s*[mM]?\s*$/,
	// chrome parser accept 0 for month and day in year month day format, but not month day year
	// eslint-disable-next-line @stylistic/max-len
	yearFirstDateFormat = /^\s*(?<year>\d{3,4})\s*[/\-.,\s]\s*(?<month>0?\d|1[0-2])\s*[/\-.,\s]\s*(?<day>[0-2]?\d|3[01])\s*$/,
	fallbackDateFormats: RegExp[] = [
		yearFirstDateFormat,
		// eslint-disable-next-line @stylistic/max-len
		/^\s*(?<month>0?[1-9]|1[0-2])\s*[/\-.,\s]\s*(?<day>0?[1-9]|[12]\d|3[01])\s*[/\-.,\s]\s*(?<year>\d{1,4})\s*$/
	];

export function isValidDate (value: unknown): boolean {
	let valid = false;

	if (value instanceof Date) {
		valid = !Number.isNaN(value.getTime());
	} else if (typeof value === "string") {
		valid = isValidStringDate(value);
	}

	return valid;
}

export function isValidTime (value: unknown): boolean {
	return typeof value === "string" && timePattern.test(value);
}

export function normalizeDate (value: unknown): Date | undefined {
	const validDate = isValidDate(value);

	let normalized;

	if (validDate && value instanceof Date) {
		normalized = value;
	} else if (validDate && typeof value === "string") {
		normalized = normalizeDateString(value);
	}

	return normalized;
}

export function normalizeTimeString (value: unknown): string | undefined {
	let normalized;

	if (isValidTime(value)) {
		const [, hour, minute, meridiemChar] = (value as string).match(timePattern) as string[];

		normalized = `${hour}:${minute} ${meridiemChar.toLowerCase()}m`;
	}

	return normalized;
}

function isValidStringDate (value: string) {
	return !Number.isNaN(new Date(value).getTime()) ||
		fallbackDateFormats.some(format => format.test(value));
}

function normalizeDateString (value: string): Date {
	let normalized = new Date(value);

	if (couldParseAsUtcMidnight(value) || Number.isNaN(normalized.getTime())) {
		normalized = normalizeNonParsableDateString(value);
	}

	return normalized;
}

function couldParseAsUtcMidnight (value: string): boolean {
	return yearFirstDateFormat.test(value);
}

function normalizeNonParsableDateString (value: string): Date {
	let normalized!: Date;

	for (const format of fallbackDateFormats) {
		const match = value.match(format);

		if (match) {
			const {year, month, day} = match.groups as {year: string, month: string, day: string};

			normalized = new Date(normalizeYear(Number(year)), Number(month) - 1, Number(day));
			break;
		}
	}

	return normalized;
}

// mimic chrome year normalization based on '1/1/year'
function normalizeYear (year: number) {
	let normalized = year;

	if (year < 50) {
		normalized = 2000 + year;
	} else if (year < 100) {
		normalized = 1900 + year;
	}

	return normalized;
}