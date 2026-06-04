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
		format: "date",
		serializeAs: "date",
		label: "Date applied"
	},
	"workArrangement:type": {
		required: true,
		label: "Work arrangement"
	},
	"workArrangement:travelMinutes": {
		format: "non-negative-integer",
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
		format: "url",
		label: "Link URL"
	},
	"interviews.label": {
		required: true,
		label: "Interview label"
	},
	"interviews.scheduled:date": {
		required: true,
		format: "date",
		serializeAs: "date",
		label: "Interview date"
	},
	"interviews.scheduled:time": {
		required: true,
		format: "time",
		label: "Interview time"
	},
	"interviews.duration:hours": {
		format: "non-negative-integer",
		serializeAs: "number",
		label: "Duration hours"
	},
	"interviews.duration:minutes": {
		format: "non-negative-integer",
		serializeAs: "number",
		label: "Duration minutes"
	},
	"interviews.location": {
		label: "Location"
	},
	"interviews.meetingLink": {
		format: "url",
		label: "Meeting link"
	}
};

export type FieldRule = {
	required?: true,
	format?: "date" | "time" | "non-negative-integer" | "url",
	serializeAs?: "string" | "number" | "date",
	label: string
};