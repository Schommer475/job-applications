import {useId} from "react";
import type React from "react";
import ErrorIcon from "../ErrorIcon";
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

export type FieldWrapperProps = {
	label: string,
	required?: boolean,
	error?: string | null,
	className?: string,
	children: (id: string, describerId: string) => React.ReactNode
};