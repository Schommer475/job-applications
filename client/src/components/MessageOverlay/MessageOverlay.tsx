import type {NoArgsCallback} from "../../types/callbacks";
import {useId, useRef} from "react";
import Overlay from "../Overlay";
import Button from "../Button";
import "./MessageOverlay.css";

export default function MessageOverlay ({
	showing,
	children,
	...layerProps
}: MessageOverlayProps) {
	return (
		<Overlay.Frame overlayLayer={showing && <MessageOverlayLayer {...layerProps} />}>
			{children}
		</Overlay.Frame>
	);
}

MessageOverlay.Layer = MessageOverlayLayer;

export function MessageOverlayLayer ({
	title,
	message,
	acknowledgeButtonVariant = "primary",
	acknowledgeButtonText = "OK",
	onAcknowledge,
	className,
	dialogProps = {}
}: MessageOverlayLayerProps) {
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
		<Overlay.Layer
			className={classNames.join(" ")}
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
		/>
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

type MessageOverlayProps = {
	showing: boolean,
	children: React.ReactNode
} & MessageOverlayLayerProps;

type MessageOverlayLayerProps = {
	className?: string | undefined,
	title?: string,
	message: React.ReactNode,
	dialogProps?: Omit<React.ComponentProps<"dialog">, "open">,
	acknowledgeButtonVariant?: string,
	acknowledgeButtonText?: string,
	onAcknowledge: NoArgsCallback
};