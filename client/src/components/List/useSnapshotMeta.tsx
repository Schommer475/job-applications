import {useContext} from "react";
import SnapshotMetaContext from "./SnapshotMetaContext.tsx";

export default function useSnapshotMeta () {
	const meta = useContext(SnapshotMetaContext);

	if (meta === null) {
		throw new Error("useSnapshotMeta must be used within SnapshotProvider");
	}

	return meta;
}