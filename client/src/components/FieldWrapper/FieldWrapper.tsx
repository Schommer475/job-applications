import {useId} from "react";
import type React from "react";
import "./FieldWrapper.css";

export default function FieldWrapper ({
	label,
	required,
	error,
	className,
	children
}: FieldWrapperProps) {
	const id = useId(),
		errorId = id + "-error",
		classNames = ["field-wrapper"];

	if (required) {
		classNames.push("required");
	}

	if (error) {
		classNames.push("error");
	}

	if (className) {
		classNames.push(className);
	}

	return (
		<div className={classNames.join(" ")}>
			<label
				className="field-label"
				htmlFor={id}
			>
				{label}
				<span
					className="required-mark"
					aria-hidden="true"
				>
					*
				</span>
			</label>
			{children(id, errorId)}
			<span
				className="error-message"
				id={errorId}
			>
				<ErrorIcon />{error}
			</span>
		</div>
	);
}

function ErrorIcon () {
	return (
		<svg className="error-icon" aria-hidden="true" viewBox="0 0 12 12">
			<circle cx="6" cy="6" r="5.5" />
			<path
				d="
					M 6,3.5
					v 3
					M 6,8
					v .5
				"
			/>
		</svg>
	);
}

export type FieldWrapperProps = {
	label: string,
	required?: boolean,
	error?: string | null,
	className?: string,
	children: (id: string, describerId: string) => React.ReactNode
};