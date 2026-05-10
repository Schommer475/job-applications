import React from "react";
import {useTabFullIds} from "./TabsContext.tsx";

export default function TabPanels ({tabs}: {tabs: TabPanelProps[]}) {
	return (
		<div className="tab-panels">
			{tabs.map(props => <TabPanel key={props.id} {...props} />)}
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

type TabPanelProps = {
	id: string,
	active: boolean,
	content: React.ReactNode | (() => React.ReactNode)
};