import {createContext} from "react";
import type {Preferences, Column} from "./types.ts";
import type React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default createContext<PreferenceContextValue<any> | null>(null);

export type PreferenceContextValue<T extends readonly Column<string>[]> = {
	status: "loading" | "loaded",
	preferences: Preferences<T>,
	setPageSize: React.Dispatch<React.SetStateAction<number>>,
	setColumns: React.Dispatch<React.SetStateAction<Preferences<T>["columns"]>>,
	setSort: React.Dispatch<React.SetStateAction<Preferences<T>["sort"]>>,
	setFilters: React.Dispatch<React.SetStateAction<Preferences<T>["filters"]>>
};