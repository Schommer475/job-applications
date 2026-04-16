import {z} from "zod";

export const loginInput = z.object({
	username: z.string().min(1),
	password: z.string().min(8).max(20)
});

export type LoginInput = z.infer<typeof loginInput>;