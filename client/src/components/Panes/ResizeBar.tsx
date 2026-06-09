import {useState, useEffect, useEffectEvent} from "react";
import type React from "react";

export const resizeBarWidth = 1;

export default function ResizeBar ({
	containerRef,
	showing,
	percentFromLeft,
	setPercentFromLeft,
	minLeftWidth,
	minRightWidth
}: ResizeBarProps) {
	const [startDrag, handleKeyDown] = useClampedPositionManager({
			showing,
			containerRef,
			setPercentFromLeft,
			minLeftWidth,
			minRightWidth
		}),
		style: React.CSSProperties = {
			left: `${percentFromLeft}%`
		};

	if (!showing) {
		style.display = "none";
	}

	return (
		<div
			className="resize-bar"
			style={style}
			onMouseDown={startDrag}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			role="separator"
			aria-orientation="vertical"
			aria-valuenow={percentFromLeft}
			aria-valuetext={`Left pane ${percentFromLeft}% of available width`}
		>
			<div className="resize-handle"></div>
		</div>
	);
}

function useClampedPositionManager ({
	showing,
	containerRef,
	setPercentFromLeft,
	minLeftWidth,
	minRightWidth
}: Omit<ResizeBarProps, "percentFromLeft">): [() => void, (event: React.KeyboardEvent) => void] {
	const [dragStarted, setDragStarted] = useState<boolean>(false),
		dragging = showing && dragStarted;

	function clampPercentage (rawPercentage: number, containerWidth: number) {
		let minimumPercentage: number = (minLeftWidth / containerWidth) * 100,
			maximumPercentage: number = ((containerWidth - minRightWidth) / containerWidth) * 100;

		if (minimumPercentage > maximumPercentage) {
			minimumPercentage = (
				minLeftWidth / (minLeftWidth + resizeBarWidth + minRightWidth)
			) * 100;
			maximumPercentage = minimumPercentage;
		}

		minimumPercentage = Math.max(0, Math.min(minimumPercentage, 100));
		maximumPercentage = Math.max(0, Math.min(maximumPercentage, 100));

		return Math.max(minimumPercentage, Math.min(rawPercentage, maximumPercentage));
	}

	function startDrag () {
		setDragStarted(true);
	}

	function handleKeyDown (event: React.KeyboardEvent) {
		const stepSize = 5,
			containerWidth = containerRef.current?.clientWidth;

		if (containerWidth != null) {
			switch (event.key) {
				case "ArrowLeft":
					event.preventDefault();
					setPercentFromLeft((current: number) => clampPercentage(
						current - stepSize,
						containerWidth
					));
					break;
				case "ArrowRight":
					event.preventDefault();
					setPercentFromLeft((current: number) => clampPercentage(
						current + stepSize,
						containerWidth
					));
					break;
				case "Home":
					event.preventDefault();
					setPercentFromLeft(clampPercentage(0, containerWidth));
					break;
				case "End":
					event.preventDefault();
					setPercentFromLeft(clampPercentage(100, containerWidth));
					break;
			}
		}
	}

	useReclampPositionWhileShowing({
		showing,
		containerRef,
		clampPercentage,
		setPercentFromLeft
	});

	useDragEffect({
		dragging,
		containerRef,
		clampPercentage,
		setDragStarted,
		setPercentFromLeft
	});

	useReclampPositionOnResize({
		showing,
		containerRef,
		clampPercentage,
		setPercentFromLeft
	});

	return [startDrag, handleKeyDown];
}

function useReclampPositionWhileShowing ({
	showing,
	containerRef,
	clampPercentage,
	setPercentFromLeft
}: UseReclampPositionWhileShowingProps) {
	useEffect(() => {
		const container = containerRef.current;

		if (showing && container) {
			setPercentFromLeft((current: number) => clampPercentage(
				current,
				container.clientWidth
			));
		}
	}, [
		containerRef,
		showing,
		clampPercentage,
		setPercentFromLeft
	]);
}

function useDragEffect ({
	dragging,
	containerRef,
	clampPercentage,
	setDragStarted,
	setPercentFromLeft
}: UseDragEffectProps) {
	const onMouseMove = useEffectEvent((event: MouseEvent, container: HTMLDivElement) => {
		const mousePositionPercentage = computeMousePercentage(
				event,
				container
			),
			clampedPositionPercentage = clampPercentage(
				mousePositionPercentage,
				container.clientWidth
			);

		setPercentFromLeft(clampedPositionPercentage);
	});

	useEffect(() => {
		let cleanup;

		function handleMouseMove (event: MouseEvent) {
			const container = containerRef.current;

			if (container) {
				onMouseMove(event, container);
			}
		}

		function cancelDrag () {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", cancelDrag);
			setDragStarted(false);
		}

		if (dragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", cancelDrag);
			cleanup = cancelDrag;
		}

		return cleanup;
	}, [dragging, containerRef, setDragStarted]);
}

function useReclampPositionOnResize ({
	showing,
	containerRef,
	clampPercentage,
	setPercentFromLeft
}: UseReclampPositionOnResizeProps) {
	const onContainerWidthChanged = useEffectEvent((newWidth: number) => {
		setPercentFromLeft(currentPercent => clampPercentage(currentPercent, newWidth));
	});

	useEffect(() => {
		const container = containerRef.current;

		let cleanup,
			observer: ResizeObserver;

		if (showing && container) {
			observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
				const entry = entries.at(0);

				if (entry) {
					onContainerWidthChanged(entry.contentRect.width);
				}
			});

			observer.observe(container);
			cleanup = () => {
				observer.disconnect();
			};
		}

		return cleanup;
	}, [showing, containerRef]);
}

function computeMousePercentage (event: MouseEvent, container: HTMLDivElement) {
	const containerRect = container.getBoundingClientRect(),
		containerLeft = containerRect.left +
			Number.parseFloat(window.getComputedStyle(container).borderLeftWidth),
		offsetX = event.clientX - containerLeft,
		newPercentage = (offsetX / container.clientWidth) * 100;

	return Math.max(0, Math.min(newPercentage, 100));
}

type ResizeBarProps = {
	containerRef: React.RefObject<HTMLDivElement | null>,
	percentFromLeft: number,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>,
	showing: boolean,
	minLeftWidth: number,
	minRightWidth: number
};

type UseReclampPositionWhileShowingProps = {
	showing: boolean,
	containerRef: React.RefObject<HTMLDivElement | null>,
	clampPercentage: ClampPercentageFunction,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>
};

type UseDragEffectProps = {
	dragging: boolean,
	containerRef: React.RefObject<HTMLDivElement | null>,
	clampPercentage: ClampPercentageFunction,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>,
	setDragStarted: React.Dispatch<React.SetStateAction<boolean>>
};

type UseReclampPositionOnResizeProps = {
	showing: boolean,
	containerRef: React.RefObject<HTMLDivElement | null>,
	clampPercentage: ClampPercentageFunction,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>
};

type ClampPercentageFunction = (rawPercentage: number, containerWidth: number) => number;