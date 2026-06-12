import {useState, useRef} from "react";
import PickerInput from "../PickerInput/PickerInput";
import type {PickerInputProps} from "../PickerInput";
import {normalizeTimeString} from "../../util/dateTime.ts";
import ClockFace from "./ClockFace.tsx";
import TimeHeader from "./TimeHeader.tsx";
import type {Mode, Hour, Minute, Period} from "./timeValues.ts";
import Button from "../Button";
import "./TimeInput.css";

export default function TimeInput ({
	className,
	...pickerInputProperties
}: TimeInputProps) {
	const classNames = [
		"time-input"
	];

	if (className) {
		classNames.push(className);
	}

	function renderPickerOnShow ({showing, commit}: RenderPickerProps) {
		let content = null;

		if (showing) {
			content = (
				<TimePicker
					current={pickerInputProperties.value}
					onSelect={commit}
				/>
			);
		}

		return content;
	}

	return (
		<PickerInput
			className={classNames.join(" ")}
			buttonAriaLabel="toggle timepicker"
			buttonIcon={<ClockIcon />}
			{...pickerInputProperties}
		>
			{renderPickerOnShow}
		</PickerInput>
	);
}

function TimePicker ({
	current,
	onSelect
}: TimePickerProps) {
	const [currentHour, currentMinute, currentPeriod] = getTimeParts(
			normalizeTimeString(current) ?? "9:00 am"
		),
		[mode, setMode] = useState<Mode>("hour"),
		[hour, setHour] = useState<Hour>(currentHour),
		[minute, setMinute] = useState<Minute>(currentMinute),
		[period, setPeriod] = useState<Period>(currentPeriod),
		setTimeRef = useRef<HTMLButtonElement | null>(null),
		hint = "Select " + mode.charAt(0).toUpperCase() + mode.slice(1);

	let clockFaceElement;

	if (mode === "hour") {
		clockFaceElement = (
			<ClockFace
				mode={mode}
				selected={hour}
				setSelected={setHour}
				onAdvance={() => setMode("minute")}
			/>
		);
	} else {
		clockFaceElement = (
			<ClockFace
				mode={mode}
				selected={minute}
				setSelected={setMinute}
				// defer focus passing to avoid click auto-firing based on enter key held
				onAdvance={() => requestAnimationFrame(() => setTimeRef.current?.focus())}
			/>
		);
	}

	function handleSetTime () {
		onSelect(`${hour}:${String(minute).padStart(2, "0")} ${period}`);
	}

	return (
		<div
			className="time-picker"
		>
			<TimeHeader
				hour={hour}
				minute={minute}
				mode={mode}
				onModeSelect={setMode}
				period={period}
				onPeriodSelect={(newPeriod: Period) => {
					setPeriod(newPeriod);
					// defer focus passing to avoid click auto-firing based on enter key held
					requestAnimationFrame(() => setTimeRef.current?.focus());
				}}
			/>
			<div className="hint">{hint}</div>
			{clockFaceElement}
			<Button
				type="button"
				className="set-time"
				variant="primary"
				ref={setTimeRef}
				onClick={handleSetTime}
			>
				Set Time
			</Button>
		</div>
	);
}

function ClockIcon () {
	return (
		<svg className="clock-icon" viewBox="0 0 16 16">
			<circle cx="8" cy="8" r="6.5" />
			<path
				d="
					M 8,4.5
					V 8
					l 2.5,2
				"
			/>
		</svg>
	);
}

function getTimeParts (normalizedTime: string): [Hour, Minute, Period] {
	const [hour, rest] = normalizedTime.split(":"),
		[minute, period] = rest.split(" ");

	return [Number(hour) as Hour, Number(minute) as Minute, period as Period];
}

type TimeInputProps = Omit<PickerInputProps, "children" | "buttonIcon" | "buttonAriaLabel">;

type RenderPickerProps = Parameters<PickerInputProps["children"]>[0];

type TimePickerProps = {
	current: TimeInputProps["value"],
	onSelect: (date: string) => void
};
