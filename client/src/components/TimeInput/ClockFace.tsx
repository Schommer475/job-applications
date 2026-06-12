import {useRef, useState, useEffect, useEffectEvent} from "react";
import type React from "react";
import type {NoArgsCallback} from "../../types/callbacks";
import {modeValues} from "./timeValues.ts";
import type {Mode, ValueFor} from "./timeValues.ts";

const clockDiameter = 178,
	modeButtonValues = {
		hour: modeValues.hour,
		minute: modeValues.minute.filter(value => (value % 5) === 0)
	},
	modeConstraints = {
		hour: {
			min: 1,
			max: 12
		},
		minute: {
			min: 0,
			max: 59
		}
	};

export default function ClockFace<M extends Mode> (props: ClockFaceProps<M>) {
	// remount the face when mode changes: recaptures focus
	// and prevents the hand from receiving a transition animation to its starting position
	return <ClockCore key={props.mode} {...props} />;
}

function ClockCore<M extends Mode> ({
	mode,
	selected,
	setSelected,
	onAdvance
}: ClockFaceProps<M>) {
	const values = modeValues[mode],
		buttonValues = modeButtonValues[mode],
		{min, max} = modeConstraints[mode],
		selectedIndex = values.findIndex(val => val === selected),
		[prevSelectedIndex, setPrevSelectedIndex] = useState<number>(selectedIndex),
		[prevHandAngle, setPrevHandAngle] = useState<number>(getHandRotation(mode, selectedIndex)),
		dialRef = useRef<HTMLDivElement | null>(null),
		handRef = useRef<HTMLDivElement | null>(null),
		handTransitionIntentRef = useHandTransitionIntent(handRef, onAdvance),
		handAngle = prevHandAngle + getMinOffsetRotation(mode, prevSelectedIndex, selectedIndex);

	useFocusOnInit(dialRef);

	function handleChange (newValue: ValueFor<M>) {
		setPrevSelectedIndex(selectedIndex);
		setPrevHandAngle(handAngle);
		setSelected(newValue);
	}

	function handleKeyDown (event: React.KeyboardEvent) {
		let offset;

		if (event.key === "Enter") {
			event.stopPropagation();
			event.preventDefault();
			handTransitionIntentRef.current = null;
			onAdvance();
		} else {
			offset = computeOffset(mode, event);
		}

		if (offset) {
			event.stopPropagation();
			event.preventDefault();
			handTransitionIntentRef.current = getArrowKeyTransitionIntent();
			handleChange(values[wrapIndex(selectedIndex + offset, values.length)]);
		}
	}

	function handleClick (value: ValueFor<M>) {
		const valueChanged = value !== selected,
			transitionsEnabled = !transitionsDisabled();

		if (valueChanged) {
			handleChange(value);
		}

		if (transitionsEnabled && (valueChanged || handTransitionIntentRef.current === "key")) {
			handTransitionIntentRef.current = "click";
		}

		if (!transitionsEnabled || (!valueChanged && handTransitionIntentRef.current === null)) {
			// defensive, on the off chance that things are disabled mid transition
			handTransitionIntentRef.current = null;
			onAdvance();
		}
	}

	return (
		<div
			className="clock-face"
			ref={dialRef}
			style={{
				width: clockDiameter,
				height: clockDiameter
			}}
			role="slider"
			aria-label={mode}
			aria-valuemin={min}
			aria-valuemax={max}
			aria-valuenow={selected}
			tabIndex={0}
			onKeyDown={handleKeyDown}
		>
			{buttonValues.map((value, index) => {
				let className;

				if (value === selected) {
					className = "selected";
				}

				return (
					<button
						className={className}
						tabIndex={-1}
						type="button"
						key={value}
						style={getNumberPosition(mode, index)}
						onClick={() => handleClick(value)}
					>
						{formatButtonText(mode, value)}
					</button>
				);
			})}
			<div
				className="clock-hand"
				ref={handRef}
				style={{
					transform: `rotate(${handAngle}deg)`
				}}
			/>
			<div className="center-dot" />
		</div>
	);
}

function useFocusOnInit (dialRef: React.RefObject<HTMLDivElement | null>) {
	useEffect(() => {
		if (dialRef.current) {
			dialRef.current.focus();
		}
	}, [dialRef]);
}

function useHandTransitionIntent (
	handRef: React.RefObject<HTMLDivElement | null>,
	onAdvance: NoArgsCallback
) {
	const handTransitionIntentRef = useRef<"key" | "click" | null>(null),
		onClickTransitionCompleted = useEffectEvent(onAdvance);

	useEffect(() => {
		const hand = handRef.current;

		hand?.addEventListener("transitionend", handleTransitionEnd);

		function handleTransitionEnd () {
			if (handTransitionIntentRef.current === "click") {
				onClickTransitionCompleted();
			}

			handTransitionIntentRef.current = null;
		}

		return () => {
			hand?.removeEventListener("transitionend", handleTransitionEnd);
		};
	}, [handRef]);

	return handTransitionIntentRef;
}

function getArrowKeyTransitionIntent () {
	let intent: "key" | null = "key";

	if (transitionsDisabled()) {
		intent = null;
	}

	return intent;
}

function transitionsDisabled () {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function computeOffset (mode: Mode, event: React.KeyboardEvent) {
	let offset: -1 | 1 | -5 | 5 | undefined,
		largeJumpSize: 1 | 5 = 5,
		arrowMultiplier: 1 | 5 = 1;

	if (mode === "hour") {
		largeJumpSize = 1;
	}

	if (event.shiftKey) {
		arrowMultiplier = largeJumpSize;
	}

	switch (event.key) {
		case "ArrowUp":
		case "ArrowRight":
			offset = 1 * arrowMultiplier;
			break;
		case "ArrowDown":
		case "ArrowLeft":
			offset = -1 * arrowMultiplier;
			break;
		case "PageUp":
			offset = largeJumpSize;
			break;
		case "PageDown":
			offset = -1 * largeJumpSize;
			break;
	}

	return offset;
}

function wrapIndex (index: number, collectionLength: number) {
	return (index + collectionLength) % collectionLength;
}

function getNumberPosition (mode: Mode, index: number) {
	const clockCenter = clockDiameter / 2,
		numbersRadius = 65,
		positionCount = modeButtonValues[mode].length,
		fullCircle = 2 * Math.PI,
		circleFraction = index / positionCount,
		twelveOClockAngle = -Math.PI / 2,
		angle = (fullCircle * circleFraction) + twelveOClockAngle;

	return {
		left: clockCenter + (numbersRadius * Math.cos(angle)),
		top: clockCenter + (numbersRadius * Math.sin(angle))
	};
}

function getHandRotation (mode: Mode, index: number) {
	const degreesPerPosition = 360 / modeValues[mode].length;

	return index * degreesPerPosition;
}

function getMinOffsetRotation (mode: Mode, prevIndex: number, index: number) {
	const degreesPerPosition = 360 / modeValues[mode].length;

	return degreesPerPosition * getMinOffset(mode, prevIndex, index);
}

function getMinOffset (mode: Mode, prevIndex: number, index: number) {
	const {clockwiseDist, counterClockwiseDist} = getRotationalDistances(mode, prevIndex, index);

	let offset = clockwiseDist;

	if (counterClockwiseDist < clockwiseDist) {
		offset = -counterClockwiseDist;
	}

	return offset;
}

function getRotationalDistances (mode: Mode, prevIndex: number, index: number) {
	const positionCount = modeValues[mode].length;

	let clockwiseDist,
		counterClockwiseDist;

	if (index >= prevIndex) {
		clockwiseDist = index - prevIndex;
		counterClockwiseDist = positionCount - clockwiseDist;
	} else {
		counterClockwiseDist = prevIndex - index;
		clockwiseDist = positionCount - counterClockwiseDist;
	}

	return {
		clockwiseDist,
		counterClockwiseDist
	};
}

function formatButtonText<M extends Mode> (mode: M, value: ValueFor<M>) {
	let formatted = String(value);

	if (mode === "minute") {
		formatted = formatted.padStart(2, "0");
	}

	return formatted;
}

type ClockFaceProps<M extends Mode> = {
	mode: M,
	selected: ValueFor<M>,
	setSelected: React.Dispatch<React.SetStateAction<ValueFor<M>>>,
	onAdvance: NoArgsCallback
};