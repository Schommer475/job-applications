import {useId, useImperativeHandle} from "react";
import type React from "react";
import TabRibbon from "./TabRibbon.tsx";
import TabPanels from "./TabPanels.tsx";
import useTabsState from "./useTabsState.tsx";
import type {InputTab, PartialInputTab, OnCloseProps} from "./useTabsState.tsx";
import "./Tabs.css";

export type {InputTab, PartialInputTab, OnCloseProps};

export default function Tabs ({
	ref,
	initialTabs,
	initialActiveTabId,
	emptyText = "No tabs open"
}: TabsProps) {
	const tabsPrefix = useId(),
		{
			tabs,
			activeTabId,
			hasTab,
			addTab,
			activateTab,
			removeTab,
			updateTab
		} = useTabsState({tabsPrefix, initialTabs, initialActiveTabId}),
		tabCount = tabs.length,
		style = {
			"--no-tabs-text": `"${emptyText}"`
		} as React.CSSProperties;

	useImperativeHandle(ref, () => ({
		hasTab,
		addTab,
		activateTab,
		removeTab,
		updateTab,
		activeTabId,
		tabCount
	}), [hasTab, addTab, activateTab, removeTab, updateTab, activeTabId, tabCount]);

	return (
		<div className="tabs"style={style}>
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
	updateTab: (tab: PartialInputTab) => void,
	readonly activeTabId: string | null,
	readonly tabCount: number
};

type TabsProps = {
	ref?: React.RefObject<TabsAPI | null>,
	initialTabs?: InputTab[],
	initialActiveTabId?: string,
	emptyText?: string
};