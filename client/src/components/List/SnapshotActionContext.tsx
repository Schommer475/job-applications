import {createContext} from "react";
import type {Preferences, Column} from "./types.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default createContext<SnapshotActions<any> | null>(null);

export type SnapshotActions<T extends readonly Column<string>[]> = {
	setColumns: (value: Preferences<T>["columns"]) => void,
	setSort: (value: Preferences<T>["sort"]) => void,
	setFilters: (value: Preferences<T>["filters"]) => void,
	setCurrentPage: (value: number) => void,
	setPageSize: (value: number) => void
};