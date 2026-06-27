import {useContext} from "react";
import SnapshotActionContext from "./SnapshotActionContext.tsx";
import type {SnapshotActions} from "./SnapshotActionContext.tsx";
import type {Column} from "./types.ts";

export default function useSnapshotActions<
	T extends readonly Column<string>[]
> (): SnapshotActions<T> {
	const actions = useContext(SnapshotActionContext);

	if (actions === null) {
		throw new Error("useSnapshotActions must be used within SnapshotProvider");
	}

	return actions;
}