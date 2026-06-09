import {useLayoutEffect, useRef} from "react";
import type React from "react";
import "./Overlay.css";
import type {NoArgsCallback} from "../../types/callbacks";

export default function Overlay ({
	showing,
	className,
	overlayContent,
	contentProps = {},
	showFocusTargetRef,
	onEscape,
	children,
	...overlayProps
}: OverlayProps) {
	const overlayBoundaryRef = useRef<HTMLDivElement | null>(null),
		classNames = ["overlay"],
		contentClassNames = ["overlay-content"],
		{className: contentClassName, ...remainingContentProps} = contentProps;

	useFocusManagement(showing, overlayBoundaryRef, showFocusTargetRef);

	if (className) {
		classNames.push(className);
	}

	if (contentClassName) {
		contentClassNames.push(contentClassName);
	}

	function handleKeyDown (event: React.KeyboardEvent) {
		if (event.key === "Escape") {
			onEscape?.();
		}
	}

	return (
		<div
			className={classNames.join(" ")}
			{...overlayProps}
		>
			{showing && (
				<div
					ref={overlayBoundaryRef}
					className="overlay-boundary"
					onKeyDown={handleKeyDown}
				>
					<div
						className={contentClassNames.join(" ")}
						{...remainingContentProps}
					>
						{overlayContent}
					</div>
				</div>
			)}
			<div
				className="overlay-children"
				inert={showing || undefined}
			>
				{children}
			</div>
		</div>
	);
}

function useFocusManagement (
	showing: boolean,
	overlayBoundaryRef: React.RefObject<HTMLDivElement | null>,
	showFocusTargetRef?: React.RefObject<{focus (): void} | null>
) {
	useLayoutEffect(() => {
		const initialFocusTarget = document.activeElement as HTMLElement | null,
			showFocusTarget = showFocusTargetRef?.current,
			overlayContent = overlayBoundaryRef.current;

		let focusWithinOverlay = true,
			cleanup;

		if (showing && showFocusTarget) {
			showFocusTarget.focus();
			overlayContent?.addEventListener("focusout", handleFocusOut);
			overlayContent?.addEventListener("focusin", handleFocusIn);
		}

		if (showFocusTargetRef) {
			cleanup = () => {
				if (showing && initialFocusTarget && focusWithinOverlay) {
					initialFocusTarget.focus();
				}

				overlayContent?.removeEventListener("focusout", handleFocusOut);
				overlayContent?.removeEventListener("focusin", handleFocusIn);
			};
		}

		function handleFocusOut (event: FocusEvent) {
			const showTerminated = event.relatedTarget === null;

			if (
				overlayContent &&
				!showTerminated &&
				!overlayContent.contains(event.relatedTarget as Node)
			) {
				focusWithinOverlay = false;
			}
		}

		function handleFocusIn () {
			focusWithinOverlay = true;
		}

		return cleanup;
	}, [showing, overlayBoundaryRef, showFocusTargetRef]);
}

type OverlayProps = React.ComponentProps<"div"> & {
	showing: boolean,
	overlayContent: React.ReactNode,
	contentProps?: Omit<React.ComponentProps<"div">, "children">,
	showFocusTargetRef?: React.RefObject<{focus (): void} | null>,
	onEscape?: NoArgsCallback,
	children: React.ReactNode
};