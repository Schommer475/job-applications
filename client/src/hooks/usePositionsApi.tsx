import useUserId from "../components/UserContext/useUserId.tsx";
import * as positions from "../api/positions.ts";
import type {SubmittedPosition} from "../api/positions.ts";
import {useRef, useEffect} from "react";
import type React from "react";

export default function usePositionsApi () {
	const userId = useUserId(),
		inflightRequestAbortersRef = useRef<AbortController[]>([]);

	useCleanupOnUserChange(userId, inflightRequestAbortersRef);

	async function create (position: SubmittedPosition) {
		return await runRequest(requestAbortController => positions.create(
			userId,
			position,
			requestAbortController
		));
	}

	async function getById (
		id: number,
		abortController?: AbortController
	) {
		return await runRequest(
			requestAbortController => positions.getById(userId, id, requestAbortController),
			abortController
		);
	}

	async function update (id: number, position: SubmittedPosition) {
		return await runRequest(requestAbortController => positions.update(
			userId,
			id,
			position,
			requestAbortController
		));
	}

	async function remove (id: number) {
		return await runRequest(requestAbortController => positions.remove(
			userId,
			id,
			requestAbortController
		));
	}

	async function runRequest<T> (
		execute: ((abortController: AbortController) => Promise<T>),
		externalAbortController?: AbortController
	): Promise<T> {
		const requestAbortController = new AbortController();

		let result: T;

		if (externalAbortController) {
			externalAbortController.signal.addEventListener("abort", forwardAbortSignal);
		}

		inflightRequestAbortersRef.current.push(requestAbortController);

		try {
			result = await execute(requestAbortController);
		} finally {
			externalAbortController?.signal.removeEventListener("abort", forwardAbortSignal);
			inflightRequestAbortersRef.current = inflightRequestAbortersRef.current
				.filter(aborter => aborter !== requestAbortController);
		}

		function forwardAbortSignal () {
			requestAbortController.abort();
		}

		return result;
	}

	return {
		create,
		getById,
		update,
		remove
	};
}

function useCleanupOnUserChange (
	userId: number,
	inflightRequestAbortersRef: InflightRequestAbortersRef
) {
	useEffect(() => {
		return () => {
			for (const inflightRequestAborter of inflightRequestAbortersRef.current) {
				inflightRequestAborter.abort();
			}

			inflightRequestAbortersRef.current = [];
		};
	}, [userId, inflightRequestAbortersRef]);
}

type InflightRequestAbortersRef = React.RefObject<AbortController[]>;