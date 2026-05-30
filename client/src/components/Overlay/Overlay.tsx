import React from "react";
import "./Overlay.css";

export default function Overlay ({
	showing,
	className,
	overlayContent,
	contentProps = {},
	children,
	...overlayProps
}: OverlayProps) {
	const classNames = ["overlay"],
		contentClassNames = ["overlay-content"],
		{className: contentClassName, ...remainingContentProps} = contentProps;

	if (className) {
		classNames.push(className);
	}

	if (contentClassName) {
		contentClassNames.push(contentClassName);
	}

	return (
		<div
			className={classNames.join(" ")}
			{...overlayProps}
		>
			{showing && (
				<div className="overlay-boundary">
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

type OverlayProps = React.ComponentProps<"div"> & {
	showing: boolean,
	overlayContent: React.ReactNode,
	contentProps?: Omit<React.ComponentProps<"div">, "children">,
	children: React.ReactNode
};