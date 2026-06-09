import type React from "react";
import Overlay from "../Overlay";
import "./PendingOverlay.css";

export default function PendingOverlay ({
	showing,
	message = "Loading, please wait",
	children
}: PendingOverlayProps) {
	return (
		<Overlay
			showing={showing}
			className="pending-overlay"
			overlayContent={(
				<>
					<div className="spinner" />
					<p>
						{message}
					</p>
				</>
			)}
		>
			{children}
		</Overlay>
	);
}

type PendingOverlayProps = {
	showing: boolean,
	message?: string,
	children: React.ReactNode
};