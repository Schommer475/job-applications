import type {NoArgsCallback} from "../../types/callbacks.tsx";
import type React from "react";

export default function TabHandle ({
	handleId,
	panelId,
	label,
	active,
	focusable,
	onSelected,
	refreshHandler,
	closeHandler
}: TabHandleProps) {
	let tabIndex = -1;

	if (focusable) {
		tabIndex = 0;
	}

	function handleKeyDown (event: React.KeyboardEvent) {
		if (event.key === "Delete") {
			event.preventDefault();
		}

		if (event.key === "Delete" && closeHandler?.enabled) {
			closeHandler.callback();
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
			<RefreshButton handler={refreshHandler} tabLabel={label} />
			<CloseButton handler={closeHandler} tabLabel={label} />
		</>
	);
}

function RefreshButton ({handler, tabLabel}: NestedButtonProps) {
	const {enabled, callback} = handler ?? {};

	let content = null;

	if (handler) {
		content = (
			<button
				className="refresh"
				tabIndex={-1}
				disabled={!enabled}
				onClick={callback}
				aria-label={`refresh tab: ${tabLabel}`}
			/>
		);
	}

	return content;
}

function CloseButton ({handler, tabLabel}: NestedButtonProps) {
	const {enabled, callback} = handler ?? {};

	let content = null;

	if (handler) {
		content = (
			<button
				className="close"
				tabIndex={-1}
				disabled={!enabled}
				onClick={callback}
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
	refreshHandler?: {
		enabled: boolean,
		callback: NoArgsCallback
	},
	closeHandler?: {
		enabled: boolean,
		callback: NoArgsCallback
	}
};

type NestedButtonProps = {
	handler?: {
		enabled: boolean,
		callback: NoArgsCallback
	},
	tabLabel: string
};