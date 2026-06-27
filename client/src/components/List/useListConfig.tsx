import {useContext} from "react";
import ListConfigContext from "./ListConfigContext.tsx";
import type {Column} from "./types.ts";

export default function useListConfig<T extends readonly Column<string>[]> () {
	const config = useContext(ListConfigContext);

	if (config === null) {
		throw new Error("useListConfig must be used within ListConfigContext");
	}

	return config as T;
}