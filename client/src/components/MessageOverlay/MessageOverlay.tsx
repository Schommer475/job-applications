import type {NoArgsCallback} from "../../types/callbacks";
import {useId, useRef} from "react";
import Overlay from "../Overlay";
import Button from "../Button";
import "./MessageOverlay.css";

export default function MessageOverlay ({
	showing,
	title,
	message,
	acknowledgeButtonVariant = "primary",
	acknowledgeButtonText = "OK",
	onAcknowledge,
	children,
	className,
	dialogProps = {},
	...otherProps
}: MessageOverlayProps) {
	const headerId = useId(),
		acknowledgeButtonRef = useRef<HTMLButtonElement | null>(null),
		classNames = ["message-overlay"];

	let effectiveHeaderId;

	if (className) {
		classNames.push(className);
	}

	if (title) {
		effectiveHeaderId = headerId;
	}

	return (
		<Overlay
			className={classNames.join(" ")}
			showing={showing}
			{...otherProps}
			showFocusTargetRef={acknowledgeButtonRef}
			onEscape={onAcknowledge}
			overlayContent={(
				<dialog
					open
					aria-labelledby={effectiveHeaderId}
					{...dialogProps}
				>
					{Boolean(title) && (
						<h2 className="title primary" id={effectiveHeaderId}>{title}</h2>
					)}
					{normalizeMessage(message)}
					<Button
						ref={acknowledgeButtonRef}
						className="acknowledge-button"
						variant={acknowledgeButtonVariant}
						onClick={onAcknowledge}
					>
						{acknowledgeButtonText}
					</Button>
				</dialog>
			)}
		>
			{children}
		</Overlay>
	);
}

function normalizeMessage (message: React.ReactNode) {
	let normalized: React.ReactNode;

	if (typeof message === "string") {
		normalized = <p className="message-text">{message}</p>;
	} else {
		normalized = message;
	}

	return normalized;
}

type MessageOverlayProps = React.ComponentProps<"div"> & {
	showing: boolean,
	title?: string,
	message: React.ReactNode,
	dialogProps?: Omit<React.ComponentProps<"dialog">, "open">,
	acknowledgeButtonVariant?: string,
	acknowledgeButtonText?: string,
	onAcknowledge: NoArgsCallback,
	children: React.ReactNode
};