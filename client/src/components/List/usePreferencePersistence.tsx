import {useEffect, useEffectEvent, useRef} from "react";
import type {Column, Preferences, Snapshot} from "./types.ts";
import useSnapshotMeta from "./useSnapshotMeta.tsx";
import useSnapshot from "./useSnapshot.tsx";
import type {SnapshotAction} from "./SnapshotProvider.tsx";

export const initialPreferencesVersion = 1;

export default function usePreferencePersistence<T extends readonly Column<string>[]> (
	persistPreferences: (preferences: Preferences<T>) => Promise<unknown>
) {
	const {preferencesVersion} = useSnapshotMeta(),
		snapshot = useSnapshot<T>(),
		syncRequestsRef = useRef<SyncRequestPreferences<T>>({
			active: null,
			pending: null
		}),
		onPreferencesChanged = useEffectEvent(queueSync);

	function queueSync () {
		const preferences = snapshotToPreferences(snapshot);

		if (syncRequestsRef.current.active) {
			syncRequestsRef.current.pending = preferences;
		} else {
			syncRequestsRef.current.active = preferences;
			runSync();
		}
	}

	async function runSync () {
		while (syncRequestsRef.current.active) {
			try {
				await persistPreferences(syncRequestsRef.current.active);
			} catch (error) {
				console.error(error);
			} finally {
				syncRequestsRef.current.active = syncRequestsRef.current.pending;
				syncRequestsRef.current.pending = null;
			}
		}
	}

	useEffect(() => {
		if (preferencesVersion > initialPreferencesVersion) {
			onPreferencesChanged();
		}
	}, [preferencesVersion]);
}

export function computePreferencesVersion<T extends readonly Column<string>[]> (
	currentVersion: number,
	actionType: SnapshotAction<T>["type"]
) {
	let nextVersion!: number;

	switch (actionType) {
		case "set current page":
			nextVersion = currentVersion;
			break;
		case "set columns":
		case "set sort":
		case "set filters":
		case "set page size":
			nextVersion = currentVersion + 1;
			break;
		default:
			actionType satisfies never;
	}

	return nextVersion;
}

function snapshotToPreferences<T extends readonly Column<string>[]> (
	{paging: {pageSize}, ...rest}: Snapshot<T>
): Preferences<T> {
	return {
		paging: {
			pageSize
		},
		...rest
	};
}

type SyncRequestPreferences<T extends readonly Column<string>[]> = {
	active: Preferences<T> | null,
	pending: Preferences<T> | null
};