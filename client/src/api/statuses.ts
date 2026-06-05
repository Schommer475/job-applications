// TODO: for now, this file is mocks, replace with actual calls

export async function get (abortController: AbortController): Promise<Status[]> {
	return await new Promise<Status[]>(resolve => setTimeout(() => resolve([{
		id: 1,
		name: "Not Applied"
	}, {
		id: 2,
		name: "Applied"
	}, {
		id: 3,
		name: "Interviewing"
	}, {
		id: 4,
		name: "Offered"
	}, {
		id: 5,
		name: "Rejected"
	}]), 650));
}

export type Status = {
	id: number,
	name: string
};
