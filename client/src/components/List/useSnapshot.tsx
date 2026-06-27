import {useContext} from "react";
import SnapshotContext from "./SnapshotContext.tsx";
import type {Snapshot, Column} from "./types.ts";

export default function useSnapshot<T extends readonly Column<string>[]> () {
	const snapshot = useContext(SnapshotContext);

	if (snapshot === null) {
		throw new Error("useSnapshot must be used within SnapshotProvider");
	}

	return snapshot as Snapshot<T>;
}