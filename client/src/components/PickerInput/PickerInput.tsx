import {useEffect, useRef, useState, useId} from "react";
import type React from "react";
import FieldWrapper from "../FieldWrapper";
import type {FieldWrapperProps} from "../FieldWrapper";
import "./PickerInput.css";

export default function PickerInput ({
	label,
	required,
	error,
	className,
	buttonAriaLabel = "toggle picker",
	buttonIcon,
	"aria-describedby": describedBy,
	children,
	ref,
	...inputProperties
}: PickerInputProps) {
	const [popoverShowing, setPopoverShowing] = useState<boolean>(false),
		wrapperRef = useRef<HTMLDivElement | null>(null),
		inputRef = useRef<HTMLInputElement | null>(null),
		buttonRef = useRef<HTMLButtonElement | null>(null),
		popoverId = useId(),
		anchorName = `--picker-${popoverId}`;

	// not generally considered best pattern, but the input should be transparent
	// change handler should be the same as for any other input
	function commitValue (value: string) {
		const input = inputRef.current,
			nativeSetter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value"
			)?.set;

		if (input && nativeSetter) {
			nativeSetter?.call(input, value);
			input.dispatchEvent(new Event("input", {
				bubbles: true
			}));
		}

		setPopoverShowing(false);
		inputRef.current?.focus();
	}

	return (
		<FieldWrapper
			label={label}
			required={required}
			error={error}
			className={className}
		>
			{(id: string, describerId: string) => (
				<div
					className="picker-input-wrapper"
					ref={wrapperRef}
					style={{anchorName}}
				>
					<input
						id={id}
						ref={(element: HTMLInputElement) => {
							inputRef.current = element;

							if (typeof ref === "function") {
								ref(element);
							} else if (ref) {
								ref.current = element;
							}
						}}
						className="field-input picker-input"
						required={required}
						aria-invalid={Boolean(error)}
						aria-describedby={[describerId, describedBy].filter(Boolean).join(" ")}
						{...inputProperties}
					/>
					<button
						type="button"
						className="toggle-picker"
						ref={buttonRef}
						aria-label={buttonAriaLabel}
						aria-controls={popoverId}
						aria-expanded={popoverShowing}
						onClick={() => setPopoverShowing(showing => !showing)}
					>
						{buttonIcon}
					</button>
					<Popover
						wrapperRef={wrapperRef}
						buttonRef={buttonRef}
						anchorName={anchorName}
						id={popoverId}
						showing={popoverShowing}
						setShowing={setPopoverShowing}
					>
						{children({
							showing: popoverShowing,
							commit: commitValue
						})}
					</Popover>
				</div>
			)}
		</FieldWrapper>
	);
}

function Popover ({
	wrapperRef,
	buttonRef,
	anchorName,
	id,
	showing,
	setShowing,
	children
}: PopoverProps) {
	const popoverRef = useRef<HTMLDivElement | null>(null);

	usePopoverApi(showing, popoverRef, wrapperRef);
	useCloseOnOutsideClick(wrapperRef, setShowing, showing);
	useCloseOnEscape(popoverRef, buttonRef, setShowing, showing);
	useCloseOnFocusOut(wrapperRef, setShowing, showing);

	return (
		<div
			id={id}
			ref={popoverRef}
			popover="manual"
			className="picker-popover"
			style={{positionAnchor: anchorName}}
		>
			{children}
		</div>
	);
}

function usePopoverApi (
	showing: boolean,
	popoverRef: React.RefObject<HTMLDivElement | null>,
	anchorRef: React.RefObject<HTMLElement | null>
) {
	useEffect(() => {
		const popover = popoverRef.current,
			anchor = anchorRef.current;

		if (showing && !popover?.matches(":popover-open") && anchor) {
			popover?.showPopover({
				source: anchor
			});
		} else if (!showing && popover?.matches(":popover-open")) {
			popover.hidePopover();
		}
	}, [showing, popoverRef, anchorRef]);
}

function useCloseOnOutsideClick (
	wrapperRef: React.RefObject<HTMLDivElement | null>,
	setShowing: React.Dispatch<React.SetStateAction<boolean>>,
	showing: boolean
) {
	useEffect(() => {
		let timeoutId: number | undefined;

		if (showing) {
			timeoutId = setTimeout(() => {
				document.addEventListener("click", handleClick);
			}, 0);
		}

		function handleClick (event: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node | null)) {
				setShowing(false);
			}
		}

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener("click", handleClick);
		};
	}, [wrapperRef, setShowing, showing]);
}

function useCloseOnFocusOut (
	wrapperRef: React.RefObject<HTMLDivElement | null>,
	setShowing: React.Dispatch<React.SetStateAction<boolean>>,
	showing: boolean
) {
	useEffect(() => {
		const wrapper = wrapperRef.current;

		if (wrapper && showing) {
			wrapper.addEventListener("focusout", handleFocusOut);
		}

		function handleFocusOut (event: FocusEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.relatedTarget as Node)) {
				setShowing(false);
			}
		}

		return () => {
			wrapper?.removeEventListener("focusout", handleFocusOut);
		};
	}, [wrapperRef, setShowing, showing]);
}

function useCloseOnEscape (
	popoverRef: React.RefObject<HTMLDivElement | null>,
	buttonRef: React.RefObject<HTMLButtonElement | null>,
	setShowing: React.Dispatch<React.SetStateAction<boolean>>,
	showing: boolean
) {
	useEffect(() => {
		const popover = popoverRef.current;

		if (popover && showing) {
			popover.addEventListener("keydown", handleKeyDown);
		}

		function handleKeyDown (event: KeyboardEvent) {
			if (event.key === "Escape") {
				setShowing(false);
				buttonRef.current?.focus();
				event.stopPropagation();
			}
		}

		return () => {
			popover?.removeEventListener("keydown", handleKeyDown);
		};
	}, [popoverRef, buttonRef, setShowing, showing]);
}

export type PickerInputProps = Omit<FieldWrapperProps, "children"> &
	Omit<React.ComponentProps<"input">, "id" | "children" | "type"> & {
		buttonAriaLabel?: string | undefined,
		buttonIcon: React.ReactNode,
		children: (props: {showing: boolean, commit: (date: string) => void}) => React.ReactNode
	};

type PopoverProps = {
	wrapperRef: React.RefObject<HTMLDivElement | null>,
	buttonRef: React.RefObject<HTMLButtonElement | null>,
	anchorName: string,
	id: string,
	showing: boolean,
	setShowing: React.Dispatch<React.SetStateAction<boolean>>,
	children: React.ReactNode
};