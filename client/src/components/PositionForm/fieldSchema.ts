import type {FieldSpecifier} from "./useFormData.tsx";

export const fieldSchema: Record<FieldSpecifier["path"], FieldRule> = {
	"company": {
		required: true,
		label: "Company"
	},
	"title": {
		required: true,
		label: "Title"
	},
	"status:id": {
		required: true,
		serializeAs: "number",
		label: "Status"
	},
	"dateApplied": {
		validationRules: ["date"],
		serializeAs: "date",
		label: "Date applied"
	},
	"workArrangement:type": {
		required: true,
		label: "Work arrangement"
	},
	"workArrangement:travelMinutes": {
		validationRules: [
			"integer",
			"min-value=0"
		],
		validationDescription: "must be a non-negative whole number",
		serializeAs: "number",
		label: "Travel minutes"
	},
	"notes": {
		label: "Notes"
	},
	"importantLinks.label": {
		required: true,
		label: "Link label"
	},
	"importantLinks.url": {
		required: true,
		validationRules: ["url"],
		label: "Link URL"
	},
	"interviews.label": {
		required: true,
		label: "Interview label"
	},
	"interviews.scheduled:date": {
		required: true,
		validationRules: ["date"],
		serializeAs: "date",
		label: "Interview date"
	},
	"interviews.scheduled:time": {
		required: true,
		validationRules: ["time"],
		label: "Interview time"
	},
	"interviews.duration:hours": {
		validationRules: [
			"integer",
			"min-value=0"
		],
		validationDescription: "must be a non-negative whole number",
		serializeAs: "number",
		label: "Duration hours"
	},
	"interviews.duration:minutes": {
		validationRules: [
			"integer",
			"min-value=0",
			"max-value=59"
		],
		validationDescription: "must be a whole number from 0 to 59",
		serializeAs: "number",
		label: "Duration minutes"
	},
	"interviews.location": {
		label: "Location"
	},
	"interviews.meetingLink": {
		validationRules: ["url"],
		label: "Meeting link"
	}
};

export type FieldRule = {
	required?: true,
	validationRules?: ValidationRule[],
	validationDescription?: string,
	serializeAs?: "string" | "number" | "date",
	label: string
};

export type ValidationRule = "date" |
	"time" |
	"url" |
	"integer" |
	`min-value=${number}` |
	`max-value=${number}`;