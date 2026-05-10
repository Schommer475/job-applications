import {createContext, useContext} from "react";

export const TabsContext = createContext<string | null>(null);

export function useTabFullIds (tabId: string) {
	const prefix = useContext(TabsContext);

	if (prefix === null) {
		throw new Error("Can only get tab ids within a Tabs component");
	}

	return {
		handleId: `${prefix}-tab-${tabId}`,
		panelId: `${prefix}-panel-${tabId}`
	};
}