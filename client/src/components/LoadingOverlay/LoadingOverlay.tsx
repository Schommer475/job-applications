import React from "react";
import "./LoadingOverlay.css";

export default function LoadingOverlay ({
	loading,
	loadingText = "Loading, please wait",
	children
}: LoadingOverlayProps) {
	return (
		<div className="loading-overlay">
			{loading && (
				<div className="overlay-boundary">
					<div className="overlay-content">
						<div className="spinner" />
						<p>
							{loadingText}
						</p>
					</div>
				</div>
			)}
			{children}
		</div>
	);
}

type LoadingOverlayProps = {
	loading: boolean,
	loadingText?: string,
	children: React.ReactNode
};