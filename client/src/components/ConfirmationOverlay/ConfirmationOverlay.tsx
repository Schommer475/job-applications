import type {NoArgsCallback} from "../../types/callbacks";
import {useId, useRef} from "react";
import Overlay from "../Overlay";
import Button from "../Button";
import "./ConfirmationOverlay.css";

export default function ConfirmationOverlay ({
	showing,
	title,
	message,
	yesButtonVariant = "primary",
	yesButtonText = "Yes",
	onYes,
	noButtonVariant = "plain",
	noButtonText = "No",
	onNo,
	children,
	className,
	dialogProps = {},
	...otherProps
}: ConfirmationOverlayProps) {
	const headerId = useId(),
		noButtonRef = useRef<HTMLButtonElement | null>(null),
		classNames = ["confirmation-overlay"];

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
			showFocusTargetRef={noButtonRef}
			onEscape={onNo}
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
					<div className="controls">
						<Button
							ref={noButtonRef}
							className="no-button"
							variant={noButtonVariant}
							onClick={onNo}
						>
							{noButtonText}
						</Button>
						<Button
							className="yes-button"
							variant={yesButtonVariant}
							onClick={onYes}
						>
							{yesButtonText}
						</Button>
					</div>
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

type ConfirmationOverlayProps = React.ComponentProps<"div"> & {
	showing: boolean,
	title?: string,
	message: React.ReactNode,
	dialogProps?: Omit<React.ComponentProps<"dialog">, "open">,
	yesButtonVariant?: string,
	yesButtonText?: string,
	onYes: NoArgsCallback,
	noButtonVariant?: string,
	noButtonText?: string,
	onNo: NoArgsCallback,
	children: React.ReactNode
};