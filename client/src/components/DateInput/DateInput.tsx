import {useState} from "react";
import PickerInput from "../PickerInput/PickerInput";
import type {PickerInputProps} from "../PickerInput";
import {normalizeDate} from "../../util/dateTime.ts";
import {DayPicker} from "react-day-picker";
import "react-day-picker/src/style.css";
import "./DateInput.css";

export default function DateInput ({
	className,
	...pickerInputProperties
}: DateInputProps) {
	const classNames = [
		"date-input"
	];

	if (className) {
		classNames.push(className);
	}

	function renderPickerOnShow ({showing, commit}: RenderPickerProps) {
		let content = null;

		if (showing) {
			content = (
				<DatePicker
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
			buttonAriaLabel="toggle datepicker"
			buttonIcon={<DateIcon />}
			{...pickerInputProperties}
		>
			{renderPickerOnShow}
		</PickerInput>
	);
}

function DatePicker ({
	current,
	onSelect
}: DatePickerProps) {
	const {selectedDate, currentMonth, setCurrentMonth} = useStableDates(normalizeDate(current));

	return (
		<DayPicker
			className="date-picker"
			month={currentMonth}
			mode="single"
			navLayout="around"
			showOutsideDays
			autoFocus
			disabled={(day: Date) => day.getMonth() !== currentMonth.getMonth()}
			onMonthChange={setCurrentMonth}
			selected={selectedDate}
			onSelect={(date: Date | undefined) => {
				if (date) {
					onSelect(formatDate(date));
				} else if (selectedDate) {
					onSelect(formatDate(selectedDate));
				}
			}}
		/>
	);
}

function DateIcon () {
	return (
		<svg className="calendar-icon" viewBox="0 0 16 16">
			<rect x="2" y="3" width="12" height="11" rx="1.5" />
			<path d="
					M 5,1.5
					v 3
					M 11,1.5
					v 3
					M 2,7
					h 12
				"
			/>
		</svg>
	);
}

function useStableDates (currentDate: Date | undefined) {
	// setter discarded because date selection causes the picker to close
	const [selectedDate] = useState<Date | undefined>(currentDate),
		[currentMonth, setCurrentMonth] = useState<Date>(selectedDate ?? new Date());

	return {
		selectedDate,
		currentMonth,
		setCurrentMonth
	};
}

function formatDate (date: Date) {
	const month = date.getMonth() + 1,
		day = date.getDate(),
		year = date.getFullYear();

	return `${month}/${day}/${year}`;
}

type DateInputProps = Omit<PickerInputProps, "children" | "buttonIcon" | "buttonAriaLabel">;

type RenderPickerProps = Parameters<PickerInputProps["children"]>[0];

type DatePickerProps = {
	current: DateInputProps["value"],
	onSelect: (date: string) => void
};