const timePattern = /^\s*((?:0?[1-9])|(?:1[0-2]))\s*:\s*([0-5]\d)\s*([aApP])\s*[mM]?\s*$/;

export function isValidDate (value: unknown): boolean {
	let parsed;

	if (typeof value === "string" || value instanceof Date) {
		parsed = new Date(value);
	}

	return parsed !== undefined && !Number.isNaN(parsed.getTime());
}

export function isValidTime (value: unknown): boolean {
	return typeof value === "string" && timePattern.test(value);
}

export function normalizeDate (value: unknown): Date | undefined {
	const validDate = isValidDate(value);

	let normalized;

	if (validDate && typeof value === "string" && parsesAsUtcMidnight(value)) {
		const [year, month, day] = value.split("-").map(Number);

		normalized = new Date(year, month - 1, day);
	} else if (validDate) {
		normalized = new Date(value as string | Date);
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

function parsesAsUtcMidnight (value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}