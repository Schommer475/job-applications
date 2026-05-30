import React from "react";
import "./Button.css";

export default function Button ({variant = "plain", className, children, ...rest}: ButtonProps) {
	const classNames = [
		"btn",
		`btn--${variant}`
	];

	if (className) {
		classNames.push(className);
	}

	return (
		<button
			className={classNames.join(" ")}
			{...rest}
		>
			{children}
		</button>
	);
}

type ButtonProps = React.ComponentProps<"button"> & {
	variant?: "plain" | "danger" | "primary" | (string & {})
};