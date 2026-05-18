import type {NoArgsCallback} from "../../types/callbacks.tsx";
import React from "react";

export default function TabHandle ({
	handleId,
	panelId,
	label,
	active,
	focusable,
	onSelected,
	onRefresh,
	onClose
}: TabHandleProps) {
	let tabIndex = -1;

	if (focusable) {
		tabIndex = 0;
	}

	function handleKeyDown (event: React.KeyboardEvent) {
		if (event.key === "Delete") {
			event.preventDefault();
			onClose?.();
		}
	}

	return (
		<>
			<button
				id={handleId}
				className="activate"
				role="tab"
				tabIndex={tabIndex}
				onKeyDown={handleKeyDown}
				onClick={onSelected}
				title={label}
				aria-label={label}
				aria-controls={panelId}
				aria-selected={active}
			>
				{label}
			</button>
			<RefreshButton onClick={onRefresh} tabLabel={label} />
			<CloseButton onClick={onClose} tabLabel={label} />
		</>
	);
}

function RefreshButton ({onClick, tabLabel}: NestedButtonProps) {
	let content = null;

	if (onClick) {
		content = (
			<button
				className="refresh"
				tabIndex={-1}
				onClick={onClick}
				aria-label={`refresh tab: ${tabLabel}`}
			/>
		);
	}

	return content;
}

function CloseButton ({onClick, tabLabel}: NestedButtonProps) {
	let content = null;

	if (onClick) {
		content = (
			<button
				className="close"
				tabIndex={-1}
				onClick={onClick}
				aria-label={`close tab: ${tabLabel}`}
			/>
		);
	}

	return content;
}

export type TabHandleProps = {
	handleId: string,
	panelId: string,
	label: string,
	active: boolean,
	focusable: boolean,
	onSelected: NoArgsCallback,
	onRefresh?: NoArgsCallback,
	onClose?: NoArgsCallback
};

type NestedButtonProps = {
	onClick?: NoArgsCallback,
	tabLabel: string
};