import Pane from "./Pane.tsx";
import ResizeBar, {resizeBarWidth} from "./ResizeBar.tsx";
import "./Panes.css";
import type {Side} from "./types.tsx";
import {useState, useRef, useEffectEvent, useEffect, useImperativeHandle} from "react";

export default function Panes ({ref, left, right, narrowWidth, onNarrowChanged}: PanesProps) {
	const containerRef = useRef<HTMLDivElement>(null),
		narrowRef = useRef<boolean>(false),
		[expanded, setExpanded] = useState<ExpandedPanes>("both"),
		classNames = ["panes"],
		minLeftWidth = coercePositive(left.minWidth),
		minRightWidth = coercePositive(right.minWidth),
		transitionWidth = computeTransitionWidth(coercePositive(narrowWidth), minLeftWidth, minRightWidth),
		narrow = useNarrowAtTransitionWidth({
			containerRef,
			transitionWidth,
			onNarrowChanged: (isNarrow: boolean) => {
				narrowRef.current = isNarrow;

				if (isNarrow) {
					collapseToSinglePane();
				}

				if (onNarrowChanged) {
					onNarrowChanged(isNarrow);
				}
			}
		}),
		style = {
			"--resize-bar-width": `${resizeBarWidth}px`
		} as React.CSSProperties;

	function collapseToSinglePane () {
		if (expanded === "both") {
			setExpanded("left");
		}
	}

	if (narrow) {
		classNames.push("narrow");
	}

	useImperativeHandle(ref, () => ({
		expand (side: Side) {
			setExpanded((expandedSide: ExpandedPanes) => {
				const oppositeSideExpanded = expandedSide === "both" || expandedSide === oppositeSide(side);

				let endState: ExpandedPanes = side;

				if (!narrowRef.current && oppositeSideExpanded) {
					endState = "both";
				}

				return endState
			});
		}
	}), []);

	function handleExpansionToggle (side: Side) {
		let newExpansion: ExpandedPanes;

		if (narrow || expanded === "both" || expanded === side) {
			newExpansion = oppositeSide(side);
		} else {
			newExpansion = "both";
		}

		setExpanded(newExpansion);
	}

	return (
		<div ref={containerRef} className={classNames.join(" ")} style={style}>
			<ResizeBar showing={!narrow && expanded === "both"}
				containerRef={containerRef}
				minLeftWidth={minLeftWidth}
				minRightWidth={minRightWidth}
			/>
			<Pane side="left"
				expanded={expanded === "both" || expanded === "left"}
				content={left.content}
				onExpansionToggle={() => handleExpansionToggle("left")}
				onRefresh={left.onRefresh}
			/>
			<Pane side="right"
				expanded={expanded === "both" || expanded === "right"}
				content={right.content}
				onExpansionToggle={() => handleExpansionToggle("right")}
				onRefresh={right.onRefresh}
			/>
		</div>
	);
}

export interface PanesAPI {
	expand: (side: Side) => void
}

function coercePositive (value?: number) {
	return Math.max(0, value ?? 0);
}

function computeTransitionWidth (userWidth: number, minLeftWidth: number, minRightWidth: number) {
	const minTransitionWidth = minLeftWidth + resizeBarWidth + minRightWidth;

	return Math.max(userWidth, minTransitionWidth);
}

function useNarrowAtTransitionWidth ({containerRef, transitionWidth, onNarrowChanged}: UseNarrowAtTransitionWidthProps) {
	const [narrow, setNarrow] = useState<boolean>(false);

	function notifyNarrowChangedIfDifferent (isNarrow: boolean) {
		if (narrow !== isNarrow) {
			onNarrowChanged(isNarrow);
		}
	}

	useNarrowCheckOnTransitionWidthChange({
		containerRef,
		transitionWidth,
		onNarrowSet: notifyNarrowChangedIfDifferent,
		setNarrow
	});

	useNarrowCheckOnResize({
		containerRef,
		transitionWidth,
		onNarrowSet: notifyNarrowChangedIfDifferent,
		setNarrow
	});

	return narrow;
}

function oppositeSide (side: Side) {
	let opposite: Side;

	switch (side) {
		case "left":
			opposite = "right";
			break;
		case "right":
			opposite = "left";
			break;
		default:
			side satisfies never;
			throw new Error("Unexpected side: " + side);
	}

	return opposite;
}

function useNarrowCheckOnTransitionWidthChange ({containerRef, transitionWidth, onNarrowSet, setNarrow}: NarrowManagementHookProps) {
	const onNarrowSetEvent = useEffectEvent((isNarrow: boolean) => {
		onNarrowSet(isNarrow);
	});

	// useEffect instead of useLayoutEffect to enable the imperativeHandle to be connected
	useEffect(() => {
		const width = containerRef.current?.clientWidth;

		if (width != null) {
			const isNarrow = width <= transitionWidth;

			setNarrow(isNarrow);
			onNarrowSetEvent(isNarrow);
		}
	}, [containerRef, transitionWidth, setNarrow]);
}

function useNarrowCheckOnResize ({containerRef, transitionWidth, onNarrowSet, setNarrow}: NarrowManagementHookProps) {
	const onContainerWidthChanged = useEffectEvent((newWidth: number) => {
		const isNarrow = newWidth <= transitionWidth;

		setNarrow(isNarrow);
		onNarrowSet(isNarrow);
	});

	useEffect(() => {
		const container = containerRef.current;

		let cleanup,
			observer: ResizeObserver;

		if (container) {
			observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
				const entry = entries.at(0);

				if (entry) {
					onContainerWidthChanged(entry.contentRect.width);
				}
			});

			observer.observe(container);
			cleanup = () => {
				observer.disconnect();
			}
		}

		return cleanup;
	}, [containerRef]);
}

type ExpandedPanes = Side | "both";

type PanesProps = {
	ref?: React.RefObject<PanesAPI|null>
	left: PaneProps,
	right: PaneProps,
	narrowWidth?: number,
	onNarrowChanged?: (narrow: boolean) => unknown
}

type PaneProps = {
	minWidth?: number,
	content: React.ReactNode | (() => React.ReactNode),
	onRefresh?: () => unknown,
}

type UseNarrowAtTransitionWidthProps = {
	containerRef: React.RefObject<HTMLDivElement|null>,
	transitionWidth: number,
	onNarrowChanged: (isNarrow: boolean) => unknown
};

type NarrowManagementHookProps = {
	containerRef: React.RefObject<HTMLDivElement|null>,
	transitionWidth: number,
	onNarrowSet: (isNarrow: boolean) => unknown,
	setNarrow: React.Dispatch<React.SetStateAction<boolean>>
};