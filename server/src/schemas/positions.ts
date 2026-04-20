import {z} from "zod";

export const positionInput = z.object({
	company: z.string().min(1).max(100),
	title: z.string().min(1).max(100),
	status: z.enum([
		"Not Applied",
		"Applied",
		"Interviewing",
		"Rejected",
		"Offered"
	]),
	dateApplied: z.nullish(z.iso.date()),
	travelMinutes: z.nullish(z.int().nonnegative()),
	notes: z.nullish(z.string()),
	importantLinks: z.array(z.object({
		label: z.string().min(1).max(100),
		url: z.url({
			protocol: /^https?$/,
			hostname: z.regexes.domain
		})
	})),
	interviews: z.array(z.object({
		label: z.string().min(1).max(100),
		scheduled: z.iso.datetime(),
		duration: z.nullish(z.object({
			hours: z.nullish(z.int().nonnegative()),
			minutes: z.nullish(z.int().nonnegative().max(59))
		})),
		location: z.nullish(z.string()),
		meetingLink: z.nullish(z.url())
	}))
});

export type PositionInput = z.infer<typeof positionInput>;