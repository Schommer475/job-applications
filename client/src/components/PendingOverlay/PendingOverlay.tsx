import type React from "react";
import Overlay from "../Overlay";
import "./PendingOverlay.css";

export default function PendingOverlay ({
	showing,
	children,
	...layerProps
}: PendingOverlayProps) {
	return (
		<Overlay.Frame overlayLayer={showing && <PendingOverlayLayer {...layerProps} />}>
			{children}
		</Overlay.Frame>
	);
}

PendingOverlay.Layer = PendingOverlayLayer;

export function PendingOverlayLayer ({
	message = "Loading, please wait"
}: PendingOverlayLayerProps) {
	return (
		<Overlay.Layer
			className="pending-overlay"
			overlayContent={(
				<>
					<div className="spinner" />
					<p>
						{message}
					</p>
				</>
			)}
		/>
	);
}

type PendingOverlayProps = {
	showing: boolean,
	children: React.ReactNode
} & PendingOverlayLayerProps;

type PendingOverlayLayerProps = {
	message?: string
};