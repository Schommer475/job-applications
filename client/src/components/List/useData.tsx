import useSnapshotMeta from "./useSnapshotMeta.tsx";
import useSnapshot from "./useSnapshot.tsx";
import getErrorMessage from "../../util/getErrorMessage.ts";
import type {Column, ListRecord, Snapshot} from "./types.ts";
import type {SnapshotAction} from "./SnapshotProvider.tsx";
import type {SnapshotMeta} from "./SnapshotMetaContext.tsx";
import {useEffect, useState, useEffectEvent} from "react";

export const initialQueryId = 1;

// TODO maxPage or similar
// TODO serialize filters, relative dates
export default function useData<T extends readonly Column<string>[]> (
	fetchData: (
		snapshot: Snapshot<T>,
		abortController?: AbortController
	) => Promise<ListRecord<T>[]>
): UseDataResult<T> {
	const {status: snapshotStatus, queryId} = useSnapshotMeta(),
		[refreshCacheId, setRefreshCacheId] = useState<number>(1),
		[currentLoadIdentity, setCurrentLoadIdentity] = useState<LoadIdentity | null>(null),
		status = deriveStatus(
			snapshotStatus,
			queryId,
			refreshCacheId,
			currentLoadIdentity
		),
		snapshot = useSnapshot<T>(),
		[records, setRecords] = useState<ListRecord<T>[]>([]),
		[error, setError] = useState<string | null>(null),
		performFetch = useEffectEvent(
			(abortController: AbortController) => fetchData(snapshot, abortController)
		);

	useEffect(() => {
		const abortController = new AbortController();

		let canceled = false;

		if (snapshotStatus !== "loading") {
			getData();
		}

		async function getData () {
			let loadedRecords;

			try {
				loadedRecords = await performFetch(abortController);

				if (!canceled) {
					setRecords(loadedRecords);
					setError(null);
				}
			} catch (error) {
				if (!canceled && (!(error instanceof Error) || error.name !== "AbortError")) {
					setError(getErrorMessage(error));
				}
			} finally {
				if (!canceled) {
					setCurrentLoadIdentity({queryId, refreshCacheId});
				}
			}
		}

		return () => {
			canceled = true;
			abortController.abort();
		};
	}, [snapshotStatus, queryId, refreshCacheId]);

	function refresh () {
		setRefreshCacheId(current => current + 1);
	}

	function clearError () {
		setError(null);
	}

	return {
		status,
		error: hideErrorWhileUnloaded(status, error),
		records,
		refresh,
		clearError
	};
}

export function computeQueryId<T extends readonly Column<string>[]> (
	currentQueryId: number,
	actionType: SnapshotAction<T>["type"]
) {
	let nextQueryId!: number;

	switch (actionType) {
		case "set columns":
			nextQueryId = currentQueryId;
			break;
		case "set sort":
		case "set filters":
		case "set current page":
		case "set page size":
			nextQueryId = currentQueryId + 1;
			break;
		default:
			actionType satisfies never;
	}

	return nextQueryId;
}

function deriveStatus (
	snapshotStatus: SnapshotMeta["status"],
	queryId: number,
	refreshCacheId: number,
	currentLoadIdentity: LoadIdentity | null
) {
	let derived: DataStatus = "loaded";

	if (snapshotStatus === "loading") {
		derived = "idle";
	} else if (queryId !== currentLoadIdentity?.queryId ||
		refreshCacheId !== currentLoadIdentity?.refreshCacheId
	) {
		derived = "loading";
	}

	return derived;
}

function hideErrorWhileUnloaded (status: DataStatus, error: string | null) {
	if (status !== "loaded") {
		error = null;
	}

	return error;
}

type UseDataResult<T extends readonly Column<string>[]> = {
	status: DataStatus,
	error: string | null,
	records: ListRecord<T>[],
	refresh: () => void,
	clearError: () => void
};

type DataStatus = "idle" | "loading" | "loaded";

type LoadIdentity = {
	queryId: number,
	refreshCacheId: number
};