import React, {useState, useEffect, useEffectEvent} from "react";

export const resizeBarWidth = 1;

export default function ResizeBar ({containerRef, showing, minLeftWidth, minRightWidth}: ResizeBarProps) {
	const [percentFromLeft, startDrag] = useClampedPositionManager({
			showing,
			containerRef,
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
		<div className="resize-bar" style={style} onMouseDown={startDrag}>
			<div className="resize-handle"></div>
		</div>
	);
}

function useClampedPositionManager ({showing, containerRef, minLeftWidth, minRightWidth}: ResizeBarProps): [number, () => void] {
	const [percentFromLeft, setPercentFromLeft] = useState<number>(50),
		[dragStarted, setDragStarted] = useState<boolean>(false),
		dragging = showing && dragStarted;

	function clampPercentage (rawPercentage: number, containerWidth: number) {
		let minimumPercentage: number = (minLeftWidth / containerWidth) * 100,
			maximumPercentage: number = ((containerWidth - minRightWidth) / containerWidth) * 100;

		if (minimumPercentage > maximumPercentage) {
			minimumPercentage = (minLeftWidth / (minLeftWidth + resizeBarWidth + minRightWidth)) * 100;
			maximumPercentage = minimumPercentage;
		}

		return Math.max(minimumPercentage, Math.min(rawPercentage, maximumPercentage));
	}

	function startDrag () {
		setDragStarted(true);
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

	return [percentFromLeft, startDrag];
}

function useReclampPositionWhileShowing ({showing, containerRef, clampPercentage, setPercentFromLeft}: UseReclampPositionWhileShowingProps) {
	useEffect(() => {
		const container = containerRef.current;

		if (showing && container) {
			setPercentFromLeft((current: number) => clampPercentage(current, container.clientWidth));
		}
	}, [
		containerRef,
		showing,
		clampPercentage,
		setPercentFromLeft
	]);
}

function useDragEffect ({dragging, containerRef, clampPercentage, setDragStarted, setPercentFromLeft}: UseDragEffectProps) {
	const onMouseMove = useEffectEvent((event: MouseEvent, container: HTMLDivElement) => {
		const mousePositionPercentage = computeMousePercentage(event, container),
			clampedPositionPercentage = clampPercentage(mousePositionPercentage, container.clientWidth);

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

function useReclampPositionOnResize ({showing, containerRef, clampPercentage, setPercentFromLeft}: UseReclampPositionOnResizeProps) {
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
			}
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
	containerRef: React.RefObject<HTMLDivElement|null>,
	showing: boolean,
	minLeftWidth: number,
	minRightWidth: number
};

type UseReclampPositionWhileShowingProps = {
	showing: boolean,
	containerRef: React.RefObject<HTMLDivElement|null>,
	clampPercentage: ClampPercentageFunction,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>
};

type UseDragEffectProps = {
	dragging: boolean,
	containerRef: React.RefObject<HTMLDivElement|null>,
	clampPercentage: ClampPercentageFunction,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>,
	setDragStarted: React.Dispatch<React.SetStateAction<boolean>>
};

type UseReclampPositionOnResizeProps = {
	showing: boolean,
	containerRef: React.RefObject<HTMLDivElement|null>,
	clampPercentage: ClampPercentageFunction,
	setPercentFromLeft: React.Dispatch<React.SetStateAction<number>>
};

type ClampPercentageFunction = (rawPercentage: number, containerWidth: number) => number;