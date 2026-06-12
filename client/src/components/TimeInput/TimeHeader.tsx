import type {Hour, Minute, Mode, Period, ValueFor} from "./timeValues.ts";
import Button from "../Button/Button.tsx";

export default function TimeHeader ({
	hour,
	minute,
	mode,
	onModeSelect,
	period,
	onPeriodSelect
}: HeaderProps) {
	return (
		<div className="header">
			<TimeModeButton
				key="hour"
				mode="hour"
				value={hour}
				selectedMode={mode}
				onSelect={onModeSelect}
			/>
			<span
				className="colon"
				aria-hidden="true"
			>
				:
			</span>
			<TimeModeButton
				key="minute"
				mode="minute"
				value={minute}
				selectedMode={mode}
				onSelect={onModeSelect}
			/>
			<div
				className="ampm-select"
				role="group"
				aria-label="AM or PM"
			>
				<PeriodButton
					key="am"
					value="am"
					selected={period}
					onSelect={onPeriodSelect}
				/>
				<PeriodButton
					key="pm"
					value="pm"
					selected={period}
					onSelect={onPeriodSelect}
				/>
			</div>
		</div>
	);
}

function TimeModeButton<M extends Mode> ({
	mode,
	value,
	selectedMode,
	onSelect
}: TimeModeButtonProps<M>) {
	const classNames = ["set-mode"];

	let tabIndex = -1,
		text = String(value);

	if (mode === selectedMode) {
		classNames.push("selected");
	} else {
		tabIndex = 0;
	}

	if (mode === "minute") {
		text = text.padStart(2, "0");
	}

	function handleClick () {
		onSelect(mode);
	}

	return (
		<button
			type="button"
			className={classNames.join(" ")}
			aria-label={`edit ${mode}, currently ${text}`}
			aria-pressed={mode === selectedMode}
			tabIndex={tabIndex}
			onClick={handleClick}
		>
			{text}
		</button>
	);
}

function PeriodButton ({
	value,
	selected,
	onSelect
}: PeriodButtonProps) {
	let tabIndex = -1,
		variant = "plain";

	if (value === selected) {
		variant = "primary";
	} else {
		tabIndex = 0;
	}

	function handleClick () {
		onSelect(value);
	}

	return (
		<Button
			type="button"
			variant={variant}
			aria-pressed={value === selected}
			tabIndex={tabIndex}
			onClick={handleClick}
		>
			{value.toUpperCase()}
		</Button>
	);
}

type HeaderProps = {
	hour: Hour,
	minute: Minute,
	mode: Mode,
	onModeSelect: (newMode: Mode) => unknown,
	period: Period,
	onPeriodSelect: (newPeriod: Period) => unknown
};

type TimeModeButtonProps<M extends Mode> = {
	mode: M,
	value: ValueFor<M>,
	selectedMode: Mode,
	onSelect: (newMode: Mode) => unknown
};

type PeriodButtonProps = {
	value: Period,
	selected: Period,
	onSelect: (newPeriod: Period) => unknown
};