import type {FieldRule} from "./fieldSchema.ts";
import {timePattern} from "./utils.ts";

export default function validateRule (
	value: string,
	{
		validationRules = [],
		validationDescription
	}: FieldRule
): string | null {
	let error: string | null = null;

	for (const validationRule of validationRules) {
		const [ruleName, property] = validationRule.split("=");

		if (ruleName === "integer" && !validateInteger(value)) {
			error = validationDescription || "must be a whole number";
			break;
		} else if (ruleName === "min-value" && !validateMin(value, property)) {
			error = validationDescription || "must be at least " + property;
			break;
		} else if (ruleName === "max-value" && !validateMax(value, property)
		) {
			error = validationDescription || "must be at most " + property;
			break;
		} else if (validationRule === "date" && !validateDate(value)) {
			error = validationDescription || "must be a valid date";
			break;
		} else if (validationRule === "time" && !validateTime(value)) {
			error = validationDescription || "must be a valid time";
			break;
		} else if (validationRule === "url" && !validateUrl(value)) {
			error = validationDescription || "must be a valid URL starting with http:// or https://";
			break;
		}
	}

	return error;
}

function validateNumber (value: string | number) {
	const parsed = Number(value);

	return !Number.isNaN(parsed);
}

function validateInteger (value: string | number) {
	const parsed = Number(value);

	return Number.isInteger(parsed);
}

function validateMin (value: string | number, target: string | number) {
	const parsed = Number(value);

	return validateNumber(parsed) && parsed >= Number(target);
}

function validateMax (value: string | number, target: string | number) {
	const parsed = Number(value);

	return validateNumber(parsed) && parsed <= Number(target);
}

function validateDate (value: string) {
	return !Number.isNaN(new Date(value).getTime());
}

function validateTime (value: string) {
	return timePattern.test(value);
}

function validateUrl (value: string) {
	let errored = false;

	try {
		const url = new URL(value);

		if (url.protocol !== "http:" && url.protocol !== "https:") {
			errored = true;
		}
	} catch {
		errored = true;
	}

	return !errored;
}