import type {Column, Snapshot, Preferences} from "./types.ts";
import {useReducer, useEffect, useEffectEvent} from "react";
import SnapshotContext from "./SnapshotContext.tsx";
import SnapshotMetaContext from "./SnapshotMetaContext.tsx";
import SnapshotActionContext from "./SnapshotActionContext.tsx";
import {initialPreferencesVersion, computePreferencesVersion} from "./usePreferencePersistence.tsx";
import {initialQueryId, computeQueryId} from "./useData.tsx";
import type {SnapshotActions} from "./SnapshotActionContext.tsx";
import type {SnapshotMeta} from "./SnapshotMetaContext.tsx";

export default function SnapshotProvider<T extends readonly Column<string>[]> ({
	defaultPreferences,
	fetchPreferences,
	children
}: {
	defaultPreferences: Preferences<T>,
	fetchPreferences: (abortController?: AbortController) => Promise<Preferences<T>>,
	children?: React.ReactNode
}) {
	const [{meta, snapshot}, dispatch] = useReducer(updateListImage, {
			meta: {
				status: "loading",
				preferencesVersion: initialPreferencesVersion,
				queryId: initialQueryId
			},
			snapshot: {
				...defaultPreferences,
				paging: {
					...defaultPreferences.paging,
					currentPage: 1
				}
			}
		}),
		actions: SnapshotActions<T> = {
			setColumns,
			setSort,
			setFilters,
			setCurrentPage,
			setPageSize
		};

	usePreferencesLoadingOnMount(
		defaultPreferences,
		fetchPreferences,
		onPreferencesLoaded
	);

	function onPreferencesLoaded (preferences: Preferences<T>) {
		dispatch({
			type: "preferences loaded",
			preferences
		});
	}

	function setColumns (columns: Preferences<T>["columns"]) {
		dispatch({
			type: "set columns",
			columns
		});
	}

	function setSort (sort: Preferences<T>["sort"]) {
		dispatch({
			type: "set sort",
			sort
		});
	}

	function setFilters (filters: Preferences<T>["filters"]) {
		dispatch({
			type: "set filters",
			filters
		});
	}

	function setCurrentPage (currentPage: number) {
		dispatch({
			type: "set current page",
			currentPage
		});
	}

	function setPageSize (pageSize: number) {
		dispatch({
			type: "set page size",
			pageSize
		});
	}

	return (
		<SnapshotMetaContext value={meta}>
			<SnapshotContext value={snapshot}>
				<SnapshotActionContext value={actions}>
					{children}
				</SnapshotActionContext>
			</SnapshotContext>
		</SnapshotMetaContext>
	);
}

function usePreferencesLoadingOnMount<T extends readonly Column<string>[]> (
	defaultPreferences: Preferences<T>,
	fetchPreferences: (abortController?: AbortController) => Promise<Preferences<T>>,
	onPreferencesLoaded: (preferences: Preferences<T>) => void
) {
	const getPreferenceHandles = useEffectEvent(() => ({
		loadPreferences: fetchPreferences,
		setLoadedPreferences (preferences?: Preferences<T>) {
			if (preferences) {
				onPreferencesLoaded(preferences);
			} else {
				onPreferencesLoaded(defaultPreferences);
			}
		}
	}));

	useEffect(() => {
		const abortController = new AbortController(),
			{loadPreferences, setLoadedPreferences} = getPreferenceHandles();

		let canceled = false;

		async function getPreferences () {
			let prefs;

			try {
				prefs = await loadPreferences(abortController);

				// TODO merge preferences and ensure valid (with looser type)
				if (!canceled) {
					setLoadedPreferences(prefs);
				}
			} catch (error) {
				if (!(error instanceof Error) || error.name !== "AbortError") {
					console.error(error);
				}

				if (!canceled) {
					setLoadedPreferences();
				}
			}
		}

		getPreferences();

		return () => {
			canceled = true;
			abortController.abort();
		};
	}, []);
}

function updateListImage<T extends readonly Column<string>[]> (
	current: ListImage<T>,
	action: ExtendedSnapshotAction<T>
): ListImage<T> {
	const actionType = action.type,
		updatedMeta = computeMeta(current.meta, actionType);

	let updatedSnapshot!: Snapshot<T>;

	switch (actionType) {
		case "preferences loaded":
			updatedSnapshot = {
				paging: {
					pageSize: action.preferences.paging.pageSize,
					currentPage: 1
				},
				columns: action.preferences.columns,
				sort: action.preferences.sort,
				filters: action.preferences.filters
			};
			break;
		case "set columns":
			updatedSnapshot = {
				...current.snapshot,
				columns: action.columns
			};
			break;
		case "set sort":
			updatedSnapshot = {
				...current.snapshot,
				paging: {
					...current.snapshot.paging,
					currentPage: 1
				},
				sort: action.sort
			};
			break;
		case "set filters":
			updatedSnapshot = {
				...current.snapshot,
				paging: {
					...current.snapshot.paging,
					currentPage: 1
				},
				filters: action.filters
			};
			break;
		case "set current page":
			updatedSnapshot = {
				...current.snapshot,
				paging: {
					...current.snapshot.paging,
					currentPage: action.currentPage
				}
			};
			break;
		case "set page size":
			updatedSnapshot = {
				...current.snapshot,
				paging: {
					...current.snapshot.paging,
					pageSize: action.pageSize
				}
			};
			break;
		default:
			actionType satisfies never;
	}

	return {
		meta: updatedMeta,
		snapshot: updatedSnapshot
	};
}

function computeMeta<T extends readonly Column<string>[]> (
	currentMeta: SnapshotMeta,
	actionType: ExtendedSnapshotAction<T>["type"]
): SnapshotMeta {
	let nextMeta: SnapshotMeta;

	if (actionType === "preferences loaded") {
		nextMeta = {
			...currentMeta,
			status: "loaded"
		};
	} else {
		nextMeta = {
			...currentMeta,
			preferencesVersion: computePreferencesVersion(
				currentMeta.preferencesVersion,
				actionType
			),
			queryId: computeQueryId(currentMeta.queryId, actionType)
		};
	}

	return nextMeta;
}

type ExtendedSnapshotAction<T extends readonly Column<string>[]> = SnapshotAction<T> |
	PreferencesLoadedAction<T>;

type PreferencesLoadedAction<T extends readonly Column<string>[]> = {
	type: "preferences loaded",
	preferences: Preferences<T>
};

export type SnapshotAction<T extends readonly Column<string>[]> = SetColumnsAction<T> |
	SetSortAction<T> |
	SetFiltersAction<T> |
	SetCurrentPageAction |
	SetPageSizeAction;

type SetColumnsAction<T extends readonly Column<string>[]> = {
	type: "set columns",
	columns: Preferences<T>["columns"]
};

type SetSortAction<T extends readonly Column<string>[]> = {
	type: "set sort",
	sort: Preferences<T>["sort"]
};

type SetFiltersAction<T extends readonly Column<string>[]> = {
	type: "set filters",
	filters: Preferences<T>["filters"]
};

type SetCurrentPageAction = {
	type: "set current page",
	currentPage: number
};

type SetPageSizeAction = {
	type: "set page size",
	pageSize: number
};

type ListImage<T extends readonly Column<string>[]> = {
	meta: SnapshotMeta,
	snapshot: Snapshot<T>
};