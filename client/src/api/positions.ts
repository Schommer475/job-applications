// TODO: for now, this file is mocks, replace with actual calls

const mockPosition: Position = {
		id: 0,
		company: "Principal",
		title: "Software Engineer II",
		status: {
			id: 3,
			name: "Interviewing",
			color: {
				text: "#000000",
				background: "#ffd400",
				border: "#ffd400"
			}
		},
		dateApplied: "2026-05-26T15:30:00.000Z",
		workArrangement: {
			type: "Hybrid"
		},
		notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed massa neque, pharetra ac dignissim a, hendrerit vitae mauris. Duis facilisis risus ut quam dictum pharetra. Vivamus lacinia fermentum sem vel rhoncus. Mauris ullamcorper lobortis tellus eget luctus. Donec fermentum ligula et ante accumsan auctor. Vivamus a elit et mi suscipit egestas. Maecenas auctor augue viverra facilisis eleifend. Ut sit amet nisi efficitur, efficitur magna ut, varius dolor. Maecenas et nibh in nibh mattis finibus. Nam dapibus libero quis euismod ornare. Aenean eget congue nunc.",
		importantLinks: [{
			label: "Job Posting",
			url: "https://testlink.com"
		}, {
			label: "Really Really really Really Really really Really Really really Really Really really long label",
			url: "https://testlink.com"
		}],
		interviews: [{
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			location: "3785 Blackwell Street, Cordova AK 99574",
			meetingLink: "foo_bar"
		}, {
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			duration: {
				hours: 1,
				minutes: 30
			},
			location: "3785 Blackwell Street, Cordova AK 99574"
		}, {
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			duration: {
				hours: 1
			},
			meetingLink: "foo_bar"
		}, {
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			duration: {
				minutes: 30
			}
		}]
	};

let mockId = 1;

export async function getById (userId: number, id: number, abortController: AbortController): Promise<Position> {
	return await new Promise<Position>(resolve => setTimeout(() => resolve({...mockPosition, id}), 650));
}

export async function create (
	userId: number,
	position: SubmittedPosition,
	abortController: AbortController
): Promise<Position> {
	return await new Promise(resolve => setTimeout(() => resolve({
		...mockPosition,
		id: mockId++
	}), 600));
}

export async function update (
	userId: number,
	id: number,
	position: SubmittedPosition,
	abortController: AbortController
): Promise<Position> {
	return await new Promise(resolve => setTimeout(() => resolve({...mockPosition, id}), 600));
}

export async function remove (userId: number, id: number, abortController: AbortController) {
	await new Promise(resolve => setTimeout(resolve, 600));
}

export type Position = {
	id: number,
	company: string,
	title: string,
	status: {
		id: number,
		name: string,
		color: {
			text: HexColor,
			background: HexColor,
			border: HexColor
		}
	},
	dateApplied: Nullish<string>,
	workArrangement: {
		type: string,
		travelMinutes?: Nullish<number>
	},
	notes?: Nullish<string>,
	importantLinks: {
		label: string,
		url: string
	}[],
	interviews: {
		label: string,
		scheduled: string,
		duration?: Nullish<{
			hours?: Nullish<number>,
			minutes?: Nullish<number>
		}>,
		location?: Nullish<string>,
		meetingLink?: Nullish<string>
	}[]
};

export type SubmittedPosition = {
	company: string,
	title: string,
	status: {
		id: number
	},
	dateApplied: Nullish<Date>,
	workArrangement: {
		type: string,
		travelMinutes?: Nullish<number>
	},
	notes?: Nullish<string>,
	importantLinks: {
		label: string,
		url: string
	}[],
	interviews: {
		label: string,
		scheduled: Date,
		duration?: Nullish<{
			hours?: Nullish<number>,
			minutes?: Nullish<number>
		}>,
		location?: Nullish<string>,
		meetingLink?: Nullish<string>
	}[]
};

type HexColor = `#${string}`;

type Nullish<T> = T | null | undefined;
