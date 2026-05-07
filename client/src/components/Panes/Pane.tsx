import React from "react";
import type {Side} from "./types.tsx";

export default function Pane ({
	side,
	expanded,
	content,
	onExpansionToggle,
	onRefresh
}: PaneProps) {
	const renderContent = toContentRenderer(content),
		classNames = ["pane", side];

	if (expanded) {
		classNames.push("expanded");
	}

	return (
		<section className={classNames.join(" ")}>
			<ToggleExpandedButton onClick={onExpansionToggle}/>
			<RefreshButton onClick={onRefresh}/>
			{renderContent()}
		</section>
	);
}

function toContentRenderer (content: React.ReactNode | (() => React.ReactNode)): () => React.ReactNode {
	let builder: () => React.ReactNode;

	if (typeof content === "function") {
		builder = content;
	} else {
		builder = () => content;
	}

	return builder;
}

function ToggleExpandedButton ({onClick}: {onClick: NoArgsCallback}) {
	return <button className="toggle-expanded" onClick={onClick}></button>
}

function RefreshButton ({onClick}: {onClick?: NoArgsCallback}) {
	let content = null;

	if (onClick) {
		content = <button className="refresh" onClick={onClick}></button>;
	}

	return content;
}

type NoArgsCallback = () => unknown;

type PaneProps = {
	onRefresh?: NoArgsCallback,
	onExpansionToggle: NoArgsCallback,
	side: Side,
	expanded: boolean,
	content: React.ReactNode | (() => React.ReactNode)
}