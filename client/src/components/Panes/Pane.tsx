import React from "react";
import type {Side} from "./types.tsx";
import type {NoArgsCallback} from "../../types/callbacks.tsx";

export default function Pane ({
	label,
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
		<section className={classNames.join(" ")} aria-label={label}>
			<ToggleExpandedButton onClick={onExpansionToggle} expanded={expanded} side={side} />
			<RefreshButton onClick={onRefresh} side={side} />
			{renderContent()}
		</section>
	);
}

function toContentRenderer (content:
	React.ReactNode | (() => React.ReactNode)
): () => React.ReactNode {
	let builder: () => React.ReactNode;

	if (typeof content === "function") {
		builder = content;
	} else {
		builder = () => content;
	}

	return builder;
}

function ToggleExpandedButton ({
	onClick,
	expanded,
	side
}: {onClick: NoArgsCallback, expanded: boolean, side: Side}) {
	return (
		<button
			className="toggle-expanded"
			title={`toggle ${side} pane expanded`}
			onClick={onClick}
			aria-expanded={expanded}
			aria-label={`toggle ${side} pane expanded`}
		/>
	);
}

function RefreshButton ({onClick, side}: {onClick?: NoArgsCallback, side: Side}) {
	let content = null;

	if (onClick) {
		content = (
			<button
				className="refresh"
				title={`refresh ${side} pane`}
				onClick={onClick}
				aria-label={`refresh ${side} pane`}
			/>
		);
	}

	return content;
}

type PaneProps = {
	label?: string,
	onRefresh?: NoArgsCallback,
	onExpansionToggle: NoArgsCallback,
	side: Side,
	expanded: boolean,
	content: React.ReactNode | (() => React.ReactNode)
};