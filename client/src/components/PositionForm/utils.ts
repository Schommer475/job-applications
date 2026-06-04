import type {FormData, FieldSpecifier, Input} from "./useFormData.tsx";
import type {SubmittedPosition} from "../../api/positions.ts";
import type {FieldRule} from "./fieldSchema.ts";
import {fieldSchema} from "./fieldSchema.ts";

const timePattern = /^\s*((?:0?[1-9])|(?:1[0-2]))\s*:\s*([0-5]\d)\s*([aApP])\s*[mM]?\s*$/;

export function validateFormData (formData: FormData): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const [field, specifier] of getSubmittableFields(formData)) {
		const rule = fieldSchema[specifier.path],
			value = field.value.trim();

		let message: string | null = null;

		if (rule.required && !value) {
			message = "is required";
		} else if (value) {
			message = validateFormat(value, rule.format);
		}

		if (message) {
			errors.push({
				message: `${rule.label} ${message}`,
				specifier
			});
		}
	}

	return errors;
}

export function extractErrorList (formData: FormData): string[] {
	const errors = new Set<string>();

	for (const [field] of getSubmittableFields(formData)) {
		if (field.error) {
			errors.add(field.error);
		}
	}

	return [...errors];
}

export function serializeFormData (formData: FormData): SubmittedPosition {
	formData = structuredClone(formData);

	formData.importantLinks = formData.importantLinks.filter(importantLinkHasContent);
	formData.interviews = formData.interviews.filter(interviewHasContent);

	for (const [field, specifier, parent, key] of getSubmittableFields(formData)) {
		(parent as Record<string, unknown>)[key] = serializeField(
			field.value, fieldSchema[specifier.path]
		);
	}

	for (const interview of formData.interviews) {
		const scheduled = interview.scheduled as unknown as {date: Date, time: string};

		(interview as {scheduled: unknown}).scheduled = new Date(
			scheduled.date.toLocaleDateString("en-US") + " " + normalizeTimeString(scheduled.time)
		);
	}

	return formData as unknown as SubmittedPosition;
}

function* getSubmittableFields (
	formData: FormData
): Generator<[Input, FieldSpecifier, object, string]> {
	yield [formData.company, {path: "company"}, formData, "company"];
	yield [formData.title, {path: "title"}, formData, "title"];
	yield [formData.status.id, {path: "status:id"}, formData.status, "id"];
	yield [formData.dateApplied, {path: "dateApplied"}, formData, "dateApplied"];
	yield [formData.workArrangement.type, {path: "workArrangement:type"}, formData.workArrangement, "type"];
	yield [formData.workArrangement.travelMinutes, {path: "workArrangement:travelMinutes"}, formData.workArrangement, "travelMinutes"];
	yield [formData.notes, {path: "notes"}, formData, "notes"];

	for (const link of formData.importantLinks) {
		if (importantLinkHasContent(link)) {
			yield [link.label, {
				path: "importantLinks.label",
				importantLinkIdentity: link.identifier
			}, link, "label"];
			yield [link.url, {
				path: "importantLinks.url",
				importantLinkIdentity: link.identifier
			}, link, "url"];
		}
	}

	for (const interview of formData.interviews) {
		if (interviewHasContent(interview)) {
			yield [interview.label, {
				path: "interviews.label",
				interviewIdentity: interview.identifier
			}, interview, "label"];
			yield [interview.scheduled.date, {
				path: "interviews.scheduled:date",
				interviewIdentity: interview.identifier
			}, interview.scheduled, "date"];
			yield [interview.scheduled.time, {
				path: "interviews.scheduled:time",
				interviewIdentity: interview.identifier
			}, interview.scheduled, "time"];
			yield [interview.duration.hours, {
				path: "interviews.duration:hours",
				interviewIdentity: interview.identifier
			}, interview.duration, "hours"];
			yield [interview.duration.minutes, {
				path: "interviews.duration:minutes",
				interviewIdentity: interview.identifier
			}, interview.duration, "minutes"];
			yield [interview.location, {
				path: "interviews.location",
				interviewIdentity: interview.identifier
			}, interview, "location"];
			yield [interview.meetingLink, {
				path: "interviews.meetingLink",
				interviewIdentity: interview.identifier
			}, interview, "meetingLink"];
		}
	}
}

function validateFormat (value: string, format: FieldRule["format"]): string | null {
	let error: string | null = null;

	if (format === "non-negative-integer" && !isNonNegativeInteger(value)) {
		error = "must be a non-negative whole number";
	} else if (format === "date" && Number.isNaN(new Date(value).getTime())) {
		error = "must be a valid date";
	} else if (format === "time" && !timePattern.test(value)) {
		error = "must be a valid time";
	} else if (format === "url") {
		try {
			const url = new URL(value);

			if (url.protocol !== "http:" && url.protocol !== "https:") {
				error = "must be a valid URL starting with http:// or https://";
			}
		} catch {
			error = "must be a valid URL starting with http:// or https://";
		}
	}

	return error;
}

function serializeField (value: string, rule: FieldRule): string | number | Date | undefined {
	value = value.trim();

	let serialized: string | number | Date | undefined;

	if (!value && !rule.required) {
		serialized = undefined;
	} else if (rule.serializeAs === "number") {
		serialized = Number(value);
	} else if (rule.serializeAs === "date") {
		serialized = serializeDate(value);
	} else {
		serialized = value;
	}

	return serialized;
}

function importantLinkHasContent ({
	label,
	url
}: FormData["importantLinks"][number]): boolean {
	return Boolean(label.value.trim() || url.value.trim());
}

function interviewHasContent ({
	label,
	scheduled,
	duration,
	location,
	meetingLink
}: FormData["interviews"][number]): boolean {
	return Boolean(
		label.value.trim() ||
		scheduled.date.value.trim() ||
		scheduled.time.value.trim() ||
		duration.hours.value.trim() ||
		duration.minutes.value.trim() ||
		location.value.trim() ||
		meetingLink.value.trim()
	);
}

function isNonNegativeInteger (value: string) {
	const numericValue = Number(value);

	return Number.isInteger(numericValue) && numericValue >= 0;
}

function normalizeTimeString (value: string) {
	const match = value.match(timePattern);

	if (!match) {
		throw new Error(`normalizeTimeString called with invalid time ${value}. ` +
			"Validate data before serializing!"
		);
	}

	const [, hour, minute, meridiemChar] = match;

	return `${hour}:${minute} ${meridiemChar.toLowerCase()}m`;
}

function serializeDate (value: string) {
	let serialized = new Date(value);

	// this specific format parses to utc midnight, coerce back to local
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		const [year, month, day] = value.split("-").map(Number);

		serialized = new Date(year, month - 1, day);
	}

	return serialized;
}

export type ValidationError = {
	message: string,
	specifier: FieldSpecifier
};