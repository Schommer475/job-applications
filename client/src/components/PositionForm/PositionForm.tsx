import type {
	InitialData,
	FormData,
	FieldSpecifier,
	Input as InputData
} from "./useFormData.tsx";
import type {SubmittedPosition} from "../../api/positions.ts";
import type {NoArgsCallback} from "../../types/callbacks";
import {
	createElement,
	createContext,
	useContext,
	useState,
	useRef,
	useEffect,
	useImperativeHandle
} from "react";
import type React from "react";
import Overlay from "../Overlay";
import PendingOverlay from "../PendingOverlay";
import MessageOverlay from "../MessageOverlay";
import useFormData from "./useFormData.tsx";
import type {FormDataAction} from "./useFormData.tsx";
import {validateFormData, serializeFormData, extractErrorList} from "./utils.ts";
import {fieldSchema} from "./fieldSchema.ts";
import Input from "../Input";
import Textarea from "../Textarea";
import Select from "../Select";
import DateInput from "../DateInput";
import TimeInput from "../TimeInput";
import Button from "../Button";
import ErrorIcon from "../ErrorIcon";
import "./PositionForm.css";

const FormContext = createContext<React.Dispatch<FormDataAction> | null>(null),
	ActionContext = createContext<FormActionRecord | null>(null),
	SpecifierContext = createContext<FieldSpecifierGetter | null>(null);

export default function PositionForm ({
	ref,
	status,
	loadErrorMessage,
	...formDataProps
}: PositionFormProps) {
	const contentRef = useRef<PositionFormApi | null>(null);

	let overlayLayer: React.ReactNode;

	if (status === "loading" || status === "submitting") {
		overlayLayer = <PendingOverlay.Layer message={computePendingMessage(status)} />;
	} else if (status === "load-error") {
		overlayLayer = (
			<MessageOverlay.Layer
				title="Error"
				message={loadErrorMessage ?? ""}
				onAcknowledge={formDataProps.onCancel}
			/>
		);
	}

	useImperativeHandle(ref, () => ({
		takeFocus () {
			contentRef.current?.takeFocus();
		}
	}), []);

	return (
		<div className="position-form">
			<Overlay.Frame overlayLayer={overlayLayer}>
				{formDataProps.initialData && (
					<PositionFormContent
						ref={contentRef}
						{...formDataProps}
					/>
				)}
			</Overlay.Frame>
		</div>
	);
}

function PositionFormContent ({
	ref,
	label,
	initialData,
	submitError,
	clearSubmitError,
	onSubmit,
	onCancel
}: PositionFormContentProps) {
	const [mostRecentAction, setMostRecentAction] = useState<FormActionRecord | null>(null),
		[formData, dispatchFormDataUpdate] = useFormData(initialData),
		[submitCacheId, setSubmitCacheId] = useState<number>(0),
		companyRef = useRef<HTMLInputElement | null>(null),
		errors = extractErrorList(formData);

	if (submitError) {
		errors.push(submitError);
	}

	useEffect(() => {
		companyRef.current?.focus();
	}, []);

	useImperativeHandle(ref, () => ({
		takeFocus () {
			companyRef.current?.focus();
		}
	}), []);

	function dispatchUpdate (action: FormDataAction) {
		setMostRecentAction(prior => ({
			type: action.type,
			id: (prior?.id ?? 0) + 1
		}));
		dispatchFormDataUpdate(action);
	}

	function getFieldSpecifier (path: FieldPath): FieldSpecifier {
		if (path.startsWith("importantLinks.") || path.startsWith("interviews.")) {
			throw new Error("invalid base field path");
		}

		return {path} as FieldSpecifier;
	}

	function handleCancel (event: React.SyntheticEvent<HTMLFormElement>) {
		event.preventDefault();
		event.stopPropagation();
		onCancel();
	}

	function handleSubmit (event: React.SubmitEvent) {
		event.preventDefault();
		event.stopPropagation();
		setSubmitCacheId(prior => prior + 1);

		clearSubmitError();
		dispatchFormDataUpdate({
			type: "clear errors"
		});

		const validationErrors = validateFormData(formData);

		if (validationErrors.length) {
			for (const {specifier, message} of validationErrors) {
				dispatchFormDataUpdate({
					type: "set error",
					fieldSpecifier: specifier,
					error: message
				});
			}
		} else {
			onSubmit(serializeFormData(formData));
		}
	}

	return (
		<FormContext value={dispatchUpdate}>
			<ActionContext value={mostRecentAction}>
				<SpecifierContext value={getFieldSpecifier}>
					<form
						className="position-form-content"
						onReset={handleCancel}
						onSubmit={handleSubmit}
						noValidate
					>
						<header>
							<h2>{label}</h2>
							<div className="required-note"><span className="required-mark">*</span> Required fields</div>
							<button
								className="close-button"
								type="reset"
								aria-label="Close"
							>
								x
							</button>
						</header>
						<div className="form-fields-container">
							<Field
								Component={Input}
								path="company"
								className="company"
								inputData={formData.company}
								ref={companyRef}
							/>
							<Field
								Component={Input}
								path="title"
								className="title"
								inputData={formData.title}
							/>
							<div className="responsive-row">
								<Field
									Component={Select}
									path="status:id"
									className="status"
									inputData={formData.status.id}
								>
									{renderOptions(formData.status.id.options)}
								</Field>
								<Field
									Component={DateInput}
									path="dateApplied"
									className="date-applied"
									inputData={formData.dateApplied}
								/>
							</div>
							<div className="responsive-row">
								<Field
									Component={Select}
									path="workArrangement:type"
									className="work-arrangement"
									inputData={formData.workArrangement.type}
								>
									{renderOptions(formData.workArrangement.type.options)}
								</Field>
								<Field
									Component={Input}
									path="workArrangement:travelMinutes"
									className="travel-minutes"
									inputData={formData.workArrangement.travelMinutes}
								/>
							</div>
							<Field
								Component={Textarea}
								path="notes"
								className="notes"
								inputData={formData.notes}
							/>
							<ListSection
								kind="important link"
								items={formData.importantLinks}
							/>
							<ListSection
								kind="interview"
								items={formData.interviews}
							/>
						</div>
						<div className="form-footer">
							<div
								className="error-region"
								aria-live="polite"
								aria-atomic={true}
							>
								{errors.length > 0 && (
									<div key={submitCacheId} className="error-box">
										<h3 className="error-heading"><ErrorIcon />Errors</h3>
										<ul>
											{errors.map((message, index) => (
												<li key={index}>{message}</li>
											))}
										</ul>
									</div>
								)}
							</div>
							<div className="controls">
								<Button
									type="reset"
								>
									Cancel
								</Button>
								<Button
									variant="primary"
									type="submit"
								>
									Submit
								</Button>
							</div>
						</div>
					</form>
				</SpecifierContext>
			</ActionContext>
		</FormContext>
	);
}

function ListSection (props: ListSectionProps) {
	const mostRecentAction = useContext(ActionContext),
		dispatchFormDataUpdate = useFormDataUpdater(),
		addButtonRef = useRef<HTMLButtonElement | null>(null),
		kindParts = props.kind.split(" "),
		titleCasedKind = kindParts.map(
			part => part.at(0)?.toUpperCase() + part.slice(1)
		).join(" "),
		className = kindParts.join("-") + "s",
		shouldFocusButton = mostRecentAction?.type === "remove " + props.kind;

	let listContent: React.ReactNode,
		focusedPosition;

	if (mostRecentAction?.type === "add " + props.kind) {
		focusedPosition = props.items.length;
	}

	if (props.kind === "important link") {
		listContent = (
			<ImportantLinksList
				items={props.items}
				focusedPosition={focusedPosition}
			/>
		);
	} else {
		listContent = (
			<InterviewsList
				items={props.items}
				focusedPosition={focusedPosition}
			/>
		);
	}

	useEffect(() => {
		if (shouldFocusButton) {
			addButtonRef.current?.focus();
		}
	}, [shouldFocusButton, mostRecentAction?.id]);

	return (
		<section className={className}>
			<div className="section-heading">
				<h3>
					{titleCasedKind + "s"}
				</h3>
				<Button
					ref={addButtonRef}
					variant="primary"
					type="button"
					onClick={() => dispatchFormDataUpdate({
						type: ("add " + props.kind) as `add ${typeof props.kind}`
					})}
				>
					Add {titleCasedKind}
				</Button>
			</div>
			{listContent}
		</section>
	);
}

function ImportantLinksList ({
	items,
	focusedPosition
}: {
	items: FormData["importantLinks"],
	focusedPosition: number | undefined
}) {
	const linkLabelSchema = fieldSchema["importantLinks.label"],
		linkUrlSchema = fieldSchema["importantLinks.url"];

	let content: React.ReactNode = null;

	if (items.length) {
		content = (
			<>
				<div className="link-columns">
					<div className="link-label-label-wrapper">
						<span
							className="header-label"
							aria-hidden={true}
						>
							{linkLabelSchema.shortLabel ?? linkLabelSchema.label}
							<span className="required-mark">*</span>
						</span>
					</div>
					<div className="link-url-label-wrapper">
						<span
							className="header-label"
							aria-hidden={true}
						>
							{linkUrlSchema.shortLabel ?? linkUrlSchema.label}
							<span className="required-mark">*</span>
						</span>
					</div>
					<div className="link-columns-spacer" aria-hidden={true} />
				</div>
				{items.map((link, index) => (
					<ImportantLink
						key={link.identifier}
						link={link}
						position={index + 1}
						takeFocus={focusedPosition === index + 1}
					/>
				))}
			</>
		);
	}

	return content;
}

function ImportantLink ({
	link,
	position,
	takeFocus
}: {
	link: FormData["importantLinks"][number],
	position: number,
	takeFocus: boolean
}) {
	const labelRef = useRef<HTMLInputElement | null>(null),
		dispatchFormDataUpdate = useFormDataUpdater(),
		anchorName = "--important-link-" + link.identifier;

	useEffect(() => {
		if (takeFocus) {
			labelRef.current?.focus();
		}
	}, [takeFocus]);

	function getFieldSpecifier (path: FieldPath): FieldSpecifier {
		if (!path.startsWith("importantLinks.")) {
			throw new Error("invalid importantLink field path");
		}

		return {
			path,
			importantLinkIdentity: link.identifier
		} as FieldSpecifier;
	}

	return (
		<SpecifierContext value={getFieldSpecifier}>
			<fieldset className="important-link">
				<legend className="visually-hidden">
					Important Link #{position}
				</legend>
				<div className="link-fields">
					<Field
						Component={Input}
						path="importantLinks.label"
						className="important-link-label"
						inputData={link.label}
						style={{anchorName}}
						ref={labelRef}
					/>
					<Field
						Component={Input}
						path="importantLinks.url"
						className="important-link-url"
						inputData={link.url}
					/>
				</div>
				<div className="button-container">
					<Button
						variant="danger"
						type="button"
						className="delete-button"
						aria-label="delete link"
						style={{positionAnchor: anchorName}}
						onClick={() => {
							dispatchFormDataUpdate({
								type: "remove important link",
								importantLinkIdentity: link.identifier
							});
						}}
					>
						<TrashIcon />
					</Button>
				</div>
			</fieldset>
		</SpecifierContext>
	);
}

function InterviewsList ({
	items,
	focusedPosition
}: {
	items: FormData["interviews"],
	focusedPosition: number | undefined
}) {
	return (
		<>
			{items.map((interview, index) => (
				<Interview
					key={interview.identifier}
					interview={interview}
					position={index + 1}
					takeFocus={focusedPosition === index + 1}
				/>
			))}
		</>
	);
}

function Interview ({
	interview,
	position,
	takeFocus
}: {
	interview: FormData["interviews"][number],
	position: number,
	takeFocus: boolean
}) {
	const labelRef = useRef<HTMLInputElement | null>(null),
		dispatchFormDataUpdate = useFormDataUpdater(),
		anchorName = "--interview-" + interview.identifier;

	useEffect(() => {
		if (takeFocus) {
			labelRef.current?.focus();
		}
	}, [takeFocus]);

	function getFieldSpecifier (path: FieldPath): FieldSpecifier {
		if (!path.startsWith("interviews.")) {
			throw new Error("invalid interview field path");
		}

		return {
			path,
			interviewIdentity: interview.identifier
		} as FieldSpecifier;
	}

	return (
		<SpecifierContext value={getFieldSpecifier}>
			<fieldset className="interview">
				<legend className="visually-hidden">
					Interview #{position}
				</legend>
				<div className="interview-row-1">
					<Field
						Component={Input}
						path="interviews.label"
						className="interview-label"
						inputData={interview.label}
						style={{anchorName}}
						ref={labelRef}
					/>
					<div className="button-container">
						<Button
							variant="danger"
							type="button"
							className="delete-button"
							aria-label="delete interview"
							style={{positionAnchor: anchorName}}
							onClick={() => {
								dispatchFormDataUpdate({
									type: "remove interview",
									interviewIdentity: interview.identifier
								});
							}}
						>
							<TrashIcon />
						</Button>
					</div>
				</div>
				<div className="interview-row-2">
					<div className="pair-1">
						<Field
							Component={DateInput}
							path="interviews.scheduled:date"
							className="interview-scheduled-date"
							inputData={interview.scheduled.date}
						/>
						<Field
							Component={TimeInput}
							path="interviews.scheduled:time"
							className="interview-scheduled-time"
							inputData={interview.scheduled.time}
						/>
					</div>
					<div className="pair-2">
						<Field
							Component={Input}
							path="interviews.duration:hours"
							className="interview-duration-hours"
							inputData={interview.duration.hours}
						/>
						<Field
							Component={Input}
							path="interviews.duration:minutes"
							className="interview-duration-minutes"
							inputData={interview.duration.minutes}
						/>
					</div>
				</div>
				<Field
					Component={Input}
					path="interviews.location"
					className="interview-location"
					inputData={interview.location}
				/>
				<Field
					Component={Input}
					path="interviews.meetingLink"
					className="interview-meeting-link"
					inputData={interview.meetingLink}
				/>
			</fieldset>
		</SpecifierContext>
	);
}

function TrashIcon () {
	return (
		<svg
			className="trash-icon"
			aria-hidden={true}
			viewBox="0 0 24 24"
		>
			<rect x="9" y="1" width="6" height="2" />
			<rect x="3" y="4" width="18" height="3" />
			<rect x="5" y="8" width="14" height="14" />
		</svg>
	);
}

function Field ({
	Component,
	path,
	inputData,
	...props
}: FieldProps) {
	const fieldProps = useFieldProps(inputData, path);

	// necessary to be able to set up refs on inputs
	// currently only works with Input/DateInput/TimeInput,
	// make sure not to call it on anything else
	return createElement(
		Component as React.ComponentType<typeof fieldProps & typeof props>,
		{...fieldProps, ...props}
	);
}

function useFieldProps (
	{value, error}: InputData,
	path: FieldPath
) {
	const dispatchFormDataUpdate = useFormDataUpdater(),
		fieldSpecifier = useFieldSpecifier(path),
		{shortLabel, label, required} = fieldSchema[path];

	return {
		label: shortLabel ?? label,
		name: path,
		required,
		value,
		error,
		onChange (event: React.ChangeEvent<
			HTMLInputElement |
			HTMLSelectElement |
			HTMLTextAreaElement
		>) {
			dispatchFormDataUpdate({
				type: "update field",
				fieldSpecifier,
				value: event.target.value
			});
		}
	};
}

function useFormDataUpdater () {
	const dispatch = useContext(FormContext);

	if (!dispatch) {
		throw new Error("useFormDataUpdater must be called within FormContext");
	}

	return dispatch;
}

function useFieldSpecifier (path: FieldPath): FieldSpecifier {
	const getSpecifier = useContext(SpecifierContext);

	if (getSpecifier === null) {
		throw new Error("useFieldSpecifier must be called within a SpecifierContext");
	}

	return getSpecifier(path);
}

function computePendingMessage (status: "loading" | "submitting") {
	const statusCapitalized = status.charAt(0).toUpperCase() + status.slice(1);

	return statusCapitalized + ", please wait";
}

function renderOptions (options: {value: string, label: string}[]): React.ReactNode {
	return (
		<>
			{options.map(({value, label}) => (
				<option
					key={value}
					value={value}
				>
					{label}
				</option>
			))}
		</>
	);
}

export type PositionFormApi = {
	takeFocus: () => void
};

type PositionFormProps = {
	ref?: React.RefObject<PositionFormApi | null>,
	label: string,
	clearSubmitError: NoArgsCallback,
	onSubmit: (position: SubmittedPosition) => unknown,
	onCancel: NoArgsCallback
} & ({
	status: "loading",
	loadErrorMessage: null,
	initialData: null,
	submitError: null
} | {
	status: "load-error",
	loadErrorMessage: string,
	initialData: null,
	submitError: null
} | {
	status: "loaded",
	loadErrorMessage: null,
	initialData: InitialData,
	submitError: string | null
} | {
	status: "submitting",
	loadErrorMessage: null,
	initialData: InitialData,
	submitError: null
});

type PositionFormContentProps = {
	ref?: React.RefObject<PositionFormApi | null>,
	label: string,
	initialData: InitialData,
	submitError: string | null,
	clearSubmitError: NoArgsCallback,
	onSubmit: (position: SubmittedPosition) => unknown,
	onCancel: NoArgsCallback
};

type FieldProps = {
	Component: React.ComponentType<Parameters<typeof Input>[0]> |
		React.ComponentType<Parameters<typeof Select>[0]> |
		React.ComponentType<Parameters<typeof Textarea>[0]> |
		React.ComponentType<Parameters<typeof DateInput>[0]> |
		React.ComponentType<Parameters<typeof TimeInput>[0]>,
	inputData: InputData,
	path: FieldPath,
	className?: string,
	style?: React.CSSProperties,
	ref?: React.RefObject<HTMLInputElement | null>,
	children?: React.ReactNode
};

type FieldSpecifierGetter = (path: FieldPath) => FieldSpecifier;
type FieldPath = FieldSpecifier["path"];
type ListSectionProps = {
	kind: "interview",
	items: FormData["interviews"]
} | {
	kind: "important link",
	items: FormData["importantLinks"]
};

type FormActionRecord = {
	type: FormDataAction["type"],
	id: number
};