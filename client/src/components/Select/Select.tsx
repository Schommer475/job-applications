import type React from "react";
import FieldWrapper from "../FieldWrapper";
import type {FieldWrapperProps} from "../FieldWrapper";
import "./Select.css";

export default function Select ({
	label,
	required,
	error,
	className,
	children,
	"aria-describedby": describedBy,
	...selectProperties
}: SelectProps) {
	return (
		<FieldWrapper
			label={label}
			required={required}
			error={error}
			className={className}
		>
			{(id: string, describerId: string) => (
				<select
					id={id}
					className="field-input"
					required={required}
					aria-invalid={Boolean(error)}
					aria-describedby={[describerId, describedBy].filter(Boolean).join(" ")}
					{...selectProperties}
				>
					{children}
				</select>
			)}
		</FieldWrapper>
	);
}

type SelectProps = Omit<FieldWrapperProps, "children"> &
	Omit<React.ComponentProps<"select">, "id">;