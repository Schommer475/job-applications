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

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "plain" | "danger" | "primary" | (string & {})
};