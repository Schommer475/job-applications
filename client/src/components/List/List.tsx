import {createContext, useContext, useState} from "react";
import type React from "react";
import type {Field, ListRecord, Column, Preferences, Snapshot} from "./types.ts";
import ListStateContext from "./SnapshotContext.tsx";
import ListConfigContext from "./ListConfigContext.tsx";
import useSnapshot from "./useSnapshot.tsx";
import useListConfig from "./useListConfig.tsx";
import usePreferencePersistence from "./usePreferencePersistence.tsx";
import SnapshotProvider from "./SnapshotProvider.tsx";
import useSnapshotMeta from "./useSnapshotMeta.tsx";
import useData from "./useData.tsx";

// configuration, settings, initial settings

// TODO selected
export default function List<T extends readonly Column<string>[]> ({
	config,
	defaultPreferences,
	fetchPreferences,
	persistPreferences
}: {
	config: T,
	defaultPreferences: Preferences<T>,
	fetchPreferences: () => Promise<Preferences<T>>,
	persistPreferences: (current: Preferences<T>) => Promise<unknown>
}) {
	const {status: preferenceStatus, preferences} = usePreferences(
			defaultPreferences,
			fetchPreferences,
			persistPreferences
		),
		[dataStatus, setDataStatus] = useState<"loading" | "loaded">("loading"),
		loading = preferenceStatus === "loading" || dataStatus === "loading";

	return (
		<ListConfigContext value={config}>
			<SnapshotProvider
				defaultPreferences={defaultPreferences}
				fetchPreferences={fetchPreferences}
			>
				<ListCore preferences={preferences} />
			</SnapshotProvider>
		</ListConfigContext>
	);
}

function ListCore<T extends readonly Column<string>[]> ({fetchData}: {
	fetchData: (query: Snapshot<T>, abortController?: AbortController) => Promise<ListRecord<T>[]> 
}) {
	const {status: snapshotStatus} = useSnapshotMeta(),
		{
			status: dataStatus,
			error,
			records,
			refresh,
			clearError
		} = useData(fetchData),
		loading = snapshotStatus === "loading" || dataStatus === "loading";

	usePreferencePersistence(persistPreferences);
}

function Grid<T extends readonly Column<string>[]> ({records}: {records: ListRecord<T>[]}) {
	return (
		<table>
			{records.map(record => {
				const identity = record.id;

				return <Row key={identity} record={record} />;
			})}
		</table>
	);
}

function Row<T extends readonly Column<string>[]> ({record}: {record: ListRecord<T>}) {
	const {columns} = useSnapshot<T>();

	return (
		<tr>
			{columns.filter(({visible}) => visible).map(column => (
				<Cell key={column.field} field={column.field} record={record} />
			))}
		</tr>
	);
}

function Cell<T extends readonly Column<string>[]> ({field, record}: {field: Field<T>, record: ListRecord<T>}) {
	const listConfig = useListConfig<T>(),
		config = listConfig.find(({field: columnField}) => columnField === field) as T[number],
		value = record[field],
		format = config.format ?? formatCell,
		className = config.className;

	return <td className={className}>{format(value)}</td>;
}

function formatCell (value: string | number | boolean | null | undefined): React.ReactNode {
	return value;
}