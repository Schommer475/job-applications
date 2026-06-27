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
		label: "Date Applied"
	},
	"workArrangement:type": {
		required: true,
		label: "Work Arrangement"
	},
	"workArrangement:travelMinutes": {
		validationRules: [
			"integer",
			"min-value=0"
		],
		validationDescription: "must be a non-negative whole number",
		serializeAs: "number",
		label: "Travel Minutes"
	},
	"notes": {
		label: "Notes"
	},
	"importantLinks.label": {
		required: true,
		label: "Link Label",
		shortLabel: "Label"
	},
	"importantLinks.url": {
		required: true,
		validationRules: ["url"],
		label: "Link URL",
		shortLabel: "URL"
	},
	"interviews.label": {
		required: true,
		label: "Interview Label",
		shortLabel: "Label"
	},
	"interviews.scheduled:date": {
		required: true,
		validationRules: ["date"],
		serializeAs: "date",
		label: "Interview Date",
		shortLabel: "Date"
	},
	"interviews.scheduled:time": {
		required: true,
		validationRules: ["time"],
		label: "Interview Time",
		shortLabel: "Time"
	},
	"interviews.duration:hours": {
		validationRules: [
			"integer",
			"min-value=0"
		],
		validationDescription: "must be a non-negative whole number",
		serializeAs: "number",
		label: "Interview Hours",
		shortLabel: "Hours"
	},
	"interviews.duration:minutes": {
		validationRules: [
			"integer",
			"min-value=0",
			"max-value=59"
		],
		validationDescription: "must be a whole number from 0 to 59",
		serializeAs: "number",
		label: "Interview Minutes",
		shortLabel: "Minutes"
	},
	"interviews.location": {
		label: "Location"
	},
	"interviews.meetingLink": {
		validationRules: ["url"],
		label: "Meeting Link"
	}
} satisfies Record<FieldSpecifier["path"], FieldRule>;

export type FieldRule = {
	required?: true,
	validationRules?: ValidationRule[],
	validationDescription?: string,
	serializeAs?: "string" | "number" | "date",
	label: string,
	shortLabel?: string
};

export type ValidationRule = "date" |
	"time" |
	"url" |
	"integer" |
	`min-value=${number}` |
	`max-value=${number}`;