import * as statusesApi from "../api/statuses.ts";
import {useRef, useEffect} from "react";
import type React from "react";

export default function useStatusesApi () {
	const inflightRequestAbortersRef = useRef<AbortController[]>([]);

	useCleanupOnUnmount(inflightRequestAbortersRef);

	async function get (abortController?: AbortController) {
		const requestAbortController = new AbortController();

		let statuses;

		if (abortController) {
			abortController.signal.addEventListener("abort", forwardAbortSignal);
		}

		inflightRequestAbortersRef.current.push(requestAbortController);

		try {
			statuses = await statusesApi.get(requestAbortController);
		} finally {
			abortController?.signal.removeEventListener("abort", forwardAbortSignal);
			inflightRequestAbortersRef.current = inflightRequestAbortersRef.current
				.filter(aborter => aborter !== requestAbortController);
		}

		function forwardAbortSignal () {
			requestAbortController.abort();
		}

		return statuses;
	}

	return {
		get
	};
}

function useCleanupOnUnmount (inflightRequestAbortersRef: InflightRequestAbortersRef) {
	useEffect(() => {
		return () => {
			for (const inflightRequestAborter of inflightRequestAbortersRef.current) {
				inflightRequestAborter.abort();
			}

			inflightRequestAbortersRef.current = [];
		};
	}, [inflightRequestAbortersRef]);
}

type InflightRequestAbortersRef = React.RefObject<AbortController[]>;