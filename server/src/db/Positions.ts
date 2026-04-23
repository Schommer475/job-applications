import postgres from "postgres";
import sql from "./sql.js";
import {transformCase, structure} from "./utils.js";
import {PositionInput} from "../schemas/positions.js";

export default class Positions {
	#sqlInstance: postgres.Sql| postgres.TransactionSql;
	#userId: number;

	constructor (userId: number) {
		Object.freeze(this);

		this.#sqlInstance = sql;
		this.#userId = userId;
	}

	async create (position: PositionInput) {
		const [{id}] = await this.#sqlInstance<{id: number}[]>`
			INSERT INTO positions (user_id, company, title, status_id, date_applied, travel_minutes, notes)
			VALUES
			(
				${this.#userId},
				${position.company.trim() || null},
				${position.title.trim() || null},
				${position.status.id},
				${position.dateApplied != null ? new Date(position.dateApplied) : null},
				${position.travelMinutes || null},
				${position.notes?.trim() || null}
			)

			RETURNING id;
		`;

		return id;
	}

	async getById (id: number) {
		const rows = await transformCase(this.#sqlInstance<PositionCoreRecord[]>`
			SELECT positions.id,
				positions.company,
				positions.title,
				statuses.id as "status:id",
				statuses.name as "status:name",
				positions.date_applied,
				positions.travel_minutes,
				positions.notes

			FROM positions

			JOIN statuses
			ON positions.status_id = statuses.id

			WHERE positions.user_id = ${this.#userId}
			AND positions.id = ${id}
		`);

		return structure(rows).shift();
	}



	async update (id: number, position: PositionInput) {
		await this.#sqlInstance<{id: number}[]>`
			UPDATE positions
			SET company = ${position.company.trim() || null},
				title = ${position.title.trim() || null},
				status_id = ${position.status.id},
				date_applied = ${position.dateApplied != null ? new Date(position.dateApplied) : null},
				travel_minutes = ${position.travelMinutes || null},
				notes = ${position.notes?.trim() || null}

			WHERE user_id = ${this.#userId}
			AND id = ${id}
		`;
	}

	async getLinks (id: number) {
		return await this.#sqlInstance<LinkRecord[]>`
			SELECT label,
				url

			FROM links

			WHERE position_id = ${id}

			ORDER BY sort_order
		`;
	}

	async setLinks (id: number, links: PositionInput["importantLinks"]) {
		await this.transaction(async () => {
			await this.#clearLinks(id);
			await this.#insertLinks(id, links);
		});
	}

	async getInterviews (id: number) {
		const rows = await transformCase(this.#sqlInstance<InterviewRecord[]>`
			SELECT label,
				scheduled,
				EXTRACT(HOUR FROM duration) AS "duration:hours",
				EXTRACT(MINUTE FROM duration) AS "duration:minutes",
				location,
				meeting_link

			FROM interviews

			WHERE position_id = ${id}

			ORDER BY scheduled DESC
		`);

		return structure(rows);
	}

	async setInterviews (id: number, interviews: PositionInput["interviews"]) {
		await this.transaction(async () => {
			await this.#clearInterviews(id);
			await this.#insertInterviews(id, interviews);
		});
	}

	async remove (id: number) {
		await this.transaction(async () => {
			await this.#clearLinks(id);
			await this.#clearInterviews(id);

			await this.#sqlInstance`
				DELETE
				FROM positions
				WHERE user_id = ${this.#userId}
				AND id = ${id}
			`;
		});
	}

	async transaction<T> (callback: () => T|Promise<T>): Promise<T> {
		let result;

		if (this.#sqlInstance === sql) {
			result = await this.#transaction(callback);
		} else {
			result = await callback();
		}

		return result;
	}

	async #transaction<T> (callback: () => T|Promise<T>): Promise<T> {
		return await sql.begin<T>(async (transactionSql) => {
			this.#sqlInstance = transactionSql;
			const result = await callback();
			this.#sqlInstance = sql;

			return result;
		}) as T;
	}

	async #clearLinks (id: number) {
		await this.#sqlInstance`
			DELETE
			FROM links
			WHERE position_id = ${id}
		`;
	}

	async #insertLinks (id: number, links: PositionInput["importantLinks"]) {
		const transformedLinks = links.map((link, index) => ({
			position_id: id,
			label: link.label.trim() || null,
			url: link.url.trim() || null,
			sort_order: index
		}));

		if (transformedLinks.length) {
			await this.#sqlInstance`
				INSERT INTO links ${this.#sqlInstance(transformedLinks, "position_id", "label", "url", "sort_order")}
			`;
		}
	}

	async #clearInterviews (id: number) {
		await this.#sqlInstance`
			DELETE
			FROM interviews
			WHERE position_id = ${id}
		`;
	}

	async #insertInterviews (id: number, interviews: PositionInput["interviews"]) {
		const transformedInterviews = interviews.map(interview => {
			return {
				position_id: id,
				label: interview.label.trim() || null,
				scheduled: new Date(interview.scheduled),
				duration: transformDuration(interview.duration),
				location: interview.location?.trim() || null,
				meeting_link: interview.meetingLink?.trim() || null
			};
		});

		if (transformedInterviews.length) {
			await this.#sqlInstance`
				INSERT INTO interviews ${this.#sqlInstance(transformedInterviews, "position_id", "label", "scheduled", "duration", "location", "meeting_link")}
			`;
		}
	}
}

function transformDuration (duration: PositionInput["interviews"][number]["duration"]) {
	const {hours, minutes} = duration ?? {};
		
	let transformed = null;

	if (hours || minutes) {
		transformed = `${hours || 0} hours ${minutes || 0} minutes`;
	}

	return transformed;
}

type PositionCoreRecord = {
	"company": string,
	"title": string,
	"status:id": number,
	"status:name": "Not Applied"|"Applied"|"Interviewing"|"Rejected"|"Offered",
	"date_applied": Date|null,
	"travel_minutes": number|null,
	"notes": string|null
};

type LinkRecord = {
	label: string,
	url: string
};

type InterviewRecord = {
	"label": string,
	"scheduled": Date,
	"duration:hours": number|null,
	"duration:minutes": number|null,
	"location": string|null,
	"meeting_link": string|null
};

