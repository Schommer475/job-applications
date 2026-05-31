import type {NoArgsCallback} from "../../types/callbacks";
import {useId, useLayoutEffect, useRef} from "react";
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
		overlayContentRef = useRef<HTMLDivElement | null>(null),
		classNames = ["message-overlay"];

	let effectiveHeaderId;

	useFocusManagement(showing, overlayContentRef, acknowledgeButtonRef);

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
			contentProps={{ref: overlayContentRef}}
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

function useFocusManagement(
	showing: boolean,
	overlayContentRef: React.RefObject<HTMLDivElement | null>,
	showFocusTargetRef: React.RefObject<HTMLButtonElement | null>
) {
	useLayoutEffect(() => {
		const initialFocusTarget = document.activeElement as HTMLElement | null,
			showFocusTarget = showFocusTargetRef.current,
			overlayContent = overlayContentRef.current;

		let focusWithinOverlay = true;

		if (showing && showFocusTarget) {
			showFocusTarget.focus();
			overlayContent?.addEventListener("focusout", handleFocusOut);
			overlayContent?.addEventListener("focusin", handleFocusIn);
		}

		function handleFocusOut (event: FocusEvent) {
			const showTerminated = event.relatedTarget === null;

			if (overlayContent && !showTerminated && !overlayContent.contains(event.relatedTarget as Node)) {
				focusWithinOverlay = false;
			}
		}

		function handleFocusIn () {
			focusWithinOverlay = true;
		}

		return () => {
			if (showing && initialFocusTarget && focusWithinOverlay) {
				initialFocusTarget.focus();
			}

			overlayContent?.removeEventListener("focusout", handleFocusOut);
			overlayContent?.removeEventListener("focusin", handleFocusIn);
		};
	}, [showing, overlayContentRef, showFocusTargetRef]);
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