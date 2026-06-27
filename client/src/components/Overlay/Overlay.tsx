import {useLayoutEffect, useRef} from "react";
import type React from "react";
import "./Overlay.css";
import type {NoArgsCallback} from "../../types/callbacks";

export default function Overlay ({
	showing,
	children,
	...layerProps
}: OverlayProps) {
	return (
		<OverlayFrame overlayLayer={showing && <OverlayLayer {...layerProps} />}>
			{children}
		</OverlayFrame>
	);
}

Overlay.Frame = OverlayFrame;
Overlay.Layer = OverlayLayer;

export function OverlayFrame ({overlayLayer, children}: OverlayFrameProps) {
	return (
		<div className="overlay">
			{overlayLayer}
			<div
				className="overlay-children"
				inert={Boolean(overlayLayer) || undefined}
			>
				{children}
			</div>
		</div>
	);
}

export function OverlayLayer ({
	className,
	overlayContent,
	contentProps = {},
	showFocusTargetRef,
	onEscape
}: OverlayLayerProps) {
	const overlayLayerRef = useRef<HTMLDivElement | null>(null),
		classNames = ["overlay-layer"],
		contentClassNames = ["overlay-content"],
		{className: contentClassName, ...remainingContentProps} = contentProps;

	useFocusManagement(overlayLayerRef, showFocusTargetRef);

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
			ref={overlayLayerRef}
			className={classNames.join(" ")}
			onKeyDown={handleKeyDown}
		>
			<div
				className={contentClassNames.join(" ")}
				{...remainingContentProps}
			>
				{overlayContent}
			</div>
		</div>
	);
}

function useFocusManagement (
	overlayLayerRef: React.RefObject<HTMLDivElement | null>,
	showFocusTargetRef?: React.RefObject<{focus (): void} | null>
) {
	useLayoutEffect(() => {
		const initialFocusTarget = document.activeElement as HTMLElement | null,
			showFocusTarget = showFocusTargetRef?.current,
			overlayContent = overlayLayerRef.current;

		let focusWithinOverlay = true,
			cleanup;

		if (showFocusTarget) {
			showFocusTarget.focus();
			overlayContent?.addEventListener("focusout", handleFocusOut);
			overlayContent?.addEventListener("focusin", handleFocusIn);
		}

		if (showFocusTargetRef) {
			cleanup = () => {
				if (initialFocusTarget && focusWithinOverlay) {
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
	}, [overlayLayerRef, showFocusTargetRef]);
}

type OverlayProps = {
	showing: boolean,
	children: React.ReactNode
} & OverlayLayerProps;

type OverlayFrameProps = {
	overlayLayer: React.ReactNode,
	children: React.ReactNode
};

type OverlayLayerProps = {
	className?: string | undefined,
	overlayContent: React.ReactNode,
	contentProps?: Omit<React.ComponentProps<"div">, "children">,
	showFocusTargetRef?: React.RefObject<{focus (): void} | null>,
	onEscape?: NoArgsCallback
};