import type React from "react";
import FieldWrapper from "../FieldWrapper";
import type {FieldWrapperProps} from "../FieldWrapper";
import "./Textarea.css";

export default function Textarea ({
	label,
	required,
	error,
	className,
	"aria-describedby": describedBy,
	...textareaProperties
}: TextareaProps) {
	return (
		<FieldWrapper
			label={label}
			required={required}
			error={error}
			className={className}
		>
			{(id: string, describerId: string) => (
				<textarea
					id={id}
					className="field-input"
					required={required}
					aria-invalid={Boolean(error)}
					aria-describedby={[describerId, describedBy].filter(Boolean).join(" ")}
					{...textareaProperties}
				/>
			)}
		</FieldWrapper>
	);
}

type TextareaProps = Omit<FieldWrapperProps, "children"> &
	Omit<React.ComponentProps<"textarea">, "id">;