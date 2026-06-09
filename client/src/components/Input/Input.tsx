import type React from "react";
import FieldWrapper from "../FieldWrapper";
import type {FieldWrapperProps} from "../FieldWrapper";

export default function Input ({
	label,
	required,
	error,
	className,
	"aria-describedby": describedBy,
	...inputProperties
}: InputProps) {
	return (
		<FieldWrapper
			label={label}
			required={required}
			error={error}
			className={className}
		>
			{(id: string, describerId: string) => (
				<input
					id={id}
					className="field-input"
					required={required}
					aria-invalid={Boolean(error)}
					aria-describedby={[describerId, describedBy].filter(Boolean).join(" ")}
					type="text"
					{...inputProperties}
				/>
			)}
		</FieldWrapper>
	);
}

type InputProps = Omit<FieldWrapperProps, "children"> &
	Omit<React.ComponentProps<"input">, "id" | "type">;