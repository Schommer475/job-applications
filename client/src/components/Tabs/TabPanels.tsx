import React, {useEffect, useRef} from "react";
import {useTabFullIds} from "./TabsContext.tsx";

export default function TabPanels ({activeTabId, tabs}: TabPanelsProps) {
	const panelsRef = useRef<HTMLDivElement | null>(null);

	useFocusPanelOnNonInitialActivation(panelsRef, activeTabId);

	return (
		<div ref={panelsRef} className="tab-panels">
			{tabs.map(props => (
				<TabPanel
					active={props.id === activeTabId}
					key={props.id}
					{...props}
				/>
			))}
		</div>
	);
}

function TabPanel ({id, active, content}: TabPanelProps) {
	const {panelId, handleId} = useTabFullIds(id),
		renderContent = toContentRenderer(content),
		classNames = ["tab-panel"];

	if (active) {
		classNames.push("active");
	}

	return (
		<div
			id={panelId}
			className={classNames.join(" ")}
			tabIndex={0}
			role="tabpanel"
			aria-labelledby={handleId}
		>
			{renderContent()}
		</div>
	);
}

// function form ensures the content has access to any context at the panel or above
function toContentRenderer (content:
	React.ReactNode | (() => React.ReactNode)
): () => React.ReactNode {
	let renderer: () => React.ReactNode;

	if (typeof content === "function") {
		renderer = content;
	} else {
		renderer = () => content;
	}

	return renderer;
}

function useFocusPanelOnNonInitialActivation (containerRef: ElementRef, activeTabId: ActiveTabId) {
	const previousActiveTabId = useRef<ActiveTabId>(activeTabId);

	useEffect(() => {
		const container = containerRef.current,
			isInitialMount = previousActiveTabId.current === activeTabId;

		previousActiveTabId.current = activeTabId;

		if (activeTabId !== null && container && !isInitialMount) {
			const panel: HTMLDivElement | null = container.querySelector(":scope > div.active");

			panel?.focus();
		}
	}, [containerRef, activeTabId]);
}

type TabPanelsProps = {
	activeTabId: string | null,
	tabs: Omit<TabPanelProps, "active">[]
};

type TabPanelProps = {
	id: string,
	active: boolean,
	content: React.ReactNode | (() => React.ReactNode)
};

type ElementRef = React.RefObject<HTMLElement | null>;

type ActiveTabId = string | null;