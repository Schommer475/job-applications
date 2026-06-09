import useUserId from "../components/UserContext/useUserId.tsx";
import * as positions from "../api/positions.ts";
import {useRef, useEffect} from "react";
import type React from "react";

export default function usePositionsApi () {
	const userId = useUserId(),
		inflightRequestAbortersRef = useRef<AbortController[]>([]);

	useCleanupOnUserChange(userId, inflightRequestAbortersRef);

	async function getById (
		id: number,
		abortController?: AbortController
	) {
		const requestAbortController = new AbortController();

		let position;

		if (abortController) {
			abortController.signal.addEventListener("abort", forwardAbortSignal);
		}

		inflightRequestAbortersRef.current.push(requestAbortController);

		try {
			position = await positions.getById(userId, id, requestAbortController);
		} finally {
			abortController?.signal.removeEventListener("abort", forwardAbortSignal);
			inflightRequestAbortersRef.current = inflightRequestAbortersRef.current
				.filter(aborter => aborter !== requestAbortController);
		}

		function forwardAbortSignal () {
			requestAbortController.abort();
		}

		return position;
	}

	async function remove (id: number) {
		const requestAbortController = new AbortController();

		inflightRequestAbortersRef.current.push(requestAbortController);

		try {
			await positions.remove(userId, id, requestAbortController);
		} finally {
			inflightRequestAbortersRef.current = inflightRequestAbortersRef.current
				.filter(aborter => aborter !== requestAbortController);
		}
	}

	return {
		getById,
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