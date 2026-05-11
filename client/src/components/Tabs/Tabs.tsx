import React, {useId} from "react";
import TabRibbon from "./TabRibbon.tsx";
import TabPanels from "./TabPanels.tsx";
import type {NoArgsCallback} from "../../types/callbacks.tsx";
import {TabsContext} from "./TabsContext.tsx";
import "./Tabs.css";

export default function Tabs ({activeTabId, tabs}: TabsProps) {
	const id = useId();

	let activeTab: string | null = activeTabId;

	if (activeTabNotPresent(activeTabId, tabs)) {
		activeTab = tabs.at(0)?.id ?? null;
		console.warn("active tab not present", activeTabId);
	}

	return (
		<TabsContext value={id}>
			<div className="tabs">
				<TabRibbon
					activeTabId={activeTab}
					tabs={tabs.map(({id, label, onSelected, onClose, onRefresh}) => ({
						id,
						label,
						onClick: onSelected,
						onClose,
						onRefresh
					}))}
				/>
				<TabPanels
					activeTabId={activeTab}
					tabs={tabs.map(({id, content}) => ({
						id,
						content
					}))}
				/>
			</div>
		</TabsContext>
	);
}

function activeTabNotPresent (activeTabId: string | null, tabs: TabProps[]) {
	return tabs.findIndex(({id}) => id === activeTabId) === -1;
}

type TabsProps = {
	activeTabId: string | null,
	tabs: TabProps[]
};

type TabProps = {
	id: string,
	label: string,
	onSelected: NoArgsCallback,
	onClose?: NoArgsCallback,
	onRefresh?: NoArgsCallback,
	content: React.ReactNode | (() => React.ReactNode)
};