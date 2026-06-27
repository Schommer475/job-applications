import {createContext} from "react";

export default createContext<SnapshotMeta | null>(null);

export type SnapshotMeta = {
	status: "loading" | "loaded",
	preferencesVersion: number,
	queryId: number
};