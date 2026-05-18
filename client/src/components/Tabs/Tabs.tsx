import React, {useId, useImperativeHandle} from "react";
import TabRibbon from "./TabRibbon.tsx";
import TabPanels from "./TabPanels.tsx";
import useTabsState from "./useTabsState.tsx";
import type {InputTab, OnCloseProps} from "./useTabsState.tsx";
import "./Tabs.css";

export type {InputTab, OnCloseProps};

export default function Tabs ({ref, initialTabs, initialActiveTabId}: TabsProps) {
	const tabsPrefix = useId(),
		{
			tabs,
			activeTabId,
			hasTab,
			addTab,
			activateTab,
			removeTab
		} = useTabsState({tabsPrefix, initialTabs, initialActiveTabId});

	useImperativeHandle(ref, () => ({
		hasTab,
		addTab,
		activateTab,
		removeTab,
		activeTabId
	}), [hasTab, addTab, activateTab, removeTab, activeTabId]);

	return (
		<div className="tabs">
			<TabRibbon
				activeTabId={activeTabId}
				tabs={tabs}
			/>
			<TabPanels
				activeTabId={activeTabId}
				tabs={tabs}
			/>
		</div>
	);
}

export interface TabsAPI {
	hasTab: (tabId: string) => boolean,
	addTab: (tab: InputTab, activate?: boolean) => void,
	activateTab: (tabId: string) => void,
	removeTab: (tabId: string) => void,
	readonly activeTabId: string | null
};

type TabsProps = {
	ref?: React.RefObject<TabsAPI | null>,
	initialTabs?: InputTab[],
	initialActiveTabId?: string
};