import {Request, Response, NextFunction} from "express";
import {z, ZodError} from "zod";
import BadRequest from "../errors/BadRequest.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function validateSchema (schema: z.ZodObject<any, any>) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse(req.body);
			next();
		} catch (error) {
			if (error instanceof ZodError) {
				throw new BadRequest(error.issues.map(toIssueText).join("\n"));
			} else {
				throw error;
			}
		}
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toIssueText (issue: any) {
	return `${issue.path.join(".")} is ${issue.message}`;
}