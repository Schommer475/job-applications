import type {NoArgsCallback} from "../../types/callbacks.tsx";
import {useTabFullIds} from "./TabsContext.tsx";

export default function TabHandle ({
	id,
	label,
	active,
	onClick,
	onRefresh,
	onClose
}: TabHandleProps) {
	const {handleId, panelId} = useTabFullIds(id);

	return (
		<>
			<button
				id={handleId}
				className="activate"
				role="tab"
				onClick={onClick}
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
				onClick={onClick}
				aria-label={`close tab: ${tabLabel}`}
			/>
		);
	}

	return content;
}

export type TabHandleProps = {
	id: string,
	label: string,
	active: boolean,
	onClick: NoArgsCallback,
	onRefresh?: NoArgsCallback,
	onClose?: NoArgsCallback
};

type NestedButtonProps = {
	onClick?: NoArgsCallback,
	tabLabel: string
};