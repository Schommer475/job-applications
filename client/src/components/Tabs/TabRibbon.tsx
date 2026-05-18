import TabHandle from "./TabHandle.tsx";
import type {TabHandleProps} from "./TabHandle.tsx";
import React, {useState, useEffect, useRef} from "react";

export default function TabRibbon ({activeTabId, tabs}: TabRibbonProps) {
	const ribbonRef = useRef<HTMLUListElement | null>(null),
		{
			focusableTabId,
			handleKeyDown,
			handleBlur
		} = useFocusManager(ribbonRef, {activeTabId, tabs});

	useHorizontalScrolling(ribbonRef);
	useScrollIntoViewOnActivation(ribbonRef, activeTabId);

	return (
		<ul
			ref={ribbonRef}
			className="tab-ribbon"
			role="tablist"
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
		>
			{tabs.map(props => {
				const classNames = ["tab-handle"],
					active = props.id === activeTabId;

				if (active) {
					classNames.push("active");
				}

				return (
					<li
						key={props.id}
						className={classNames.join(" ")}
						role="presentation"
						title={props.label}
					>
						<TabHandle
							active={active}
							focusable={props.id === focusableTabId}
							{...props}
						/>
					</li>
				);
			})}
		</ul>
	);
}

function useHorizontalScrolling (elementRef: ElementRef) {
	useEffect(() => {
		const element = elementRef.current;

		let cleanup;

		function handleWheelEvent (event: WheelEvent) {
			if (element) {
				event.preventDefault();
				event.stopPropagation();
				element.scrollLeft += event.deltaY;
			}
		}

		if (element) {
			element.addEventListener("wheel", handleWheelEvent, {
				passive: false
			});
			cleanup = () => {
				element.removeEventListener("wheel", handleWheelEvent);
			};
		}

		return cleanup;
	}, [elementRef]);
}

function useFocusManager (ribbonRef: ElementRef, {activeTabId, tabs}: TabRibbonProps) {
	const [focusOverride, setFocusOverride] = useState<FocusOverride | null>(null),
		focusableTabId = getFocusableTabId(activeTabId, tabs, focusOverride);

	function handleKeyDown (event: React.KeyboardEvent) {
		const ribbon = ribbonRef.current,
			offset = computeTabOffset(event);

		let tabAtOffset;

		if (offset) {
			tabAtOffset = getTabAtOffset(
				focusableTabId,
				offset,
				tabs
			);
		}

		if (ribbon && tabAtOffset) {
			event.preventDefault();
			setFocusOverride({
				id: tabAtOffset.id,
				forActiveTabId: activeTabId
			});
			document.getElementById(tabAtOffset.handleId)?.focus();
		}
	}

	function handleBlur (event: React.FocusEvent) {
		const ribbon = ribbonRef.current;

		if (ribbon && !ribbon.contains(event.relatedTarget)) {
			setFocusOverride(null);
		}
	}

	return {
		focusableTabId,
		handleKeyDown,
		handleBlur
	};
}

function useScrollIntoViewOnActivation (scrollContainerRef: ElementRef, activeTabId: ActiveTabId) {
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;

		if (scrollContainer && activeTabId !== null) {
			scrollContainer.querySelector("li.active")?.scrollIntoView({
				block: "nearest",
				inline: "nearest"
			});
		}
	}, [scrollContainerRef, activeTabId]);
}

function computeTabOffset (event: React.KeyboardEvent) {
	let offset: -1 | 1 | undefined;

	switch (event.key) {
		case "ArrowDown":
		case "ArrowRight":
			offset = 1;
			break;
		case "ArrowUp":
		case "ArrowLeft":
			offset = -1;
			break;
	}

	return offset;
}

function getFocusableTabId (activeTabId: ActiveTabId, tabs: TabRibbonProps["tabs"], focusOverride: FocusOverride | null) {
	const sameActiveTab = focusOverride?.forActiveTabId === activeTabId,
		overrideTabStillExists = tabs.some(({id}) => id === focusOverride?.id);

	let focusableTabId = activeTabId;

	if (focusOverride && sameActiveTab && overrideTabStillExists) {
		focusableTabId = focusOverride.id;
	}

	return focusableTabId;
}

function getTabAtOffset (currentTabId: string | null, offset: -1 | 1, tabs: TabRibbonProps["tabs"]) {
	const currentIndex = tabs.findIndex(({id}) => id === currentTabId);

	let tabAtOffset;

	if (currentIndex !== -1) {
		tabAtOffset = tabs.at(bound(
			0,
			currentIndex + offset,
			tabs.length - 1
		));
	}

	return tabAtOffset;
}

function bound (min: number, value: number, max: number) {
	return Math.max(min, Math.min(value, max));
}

type TabRibbonProps = {
	activeTabId: ActiveTabId,
	tabs: (Omit<TabHandleProps, "active" | "focusable"> & {id: string})[]
};

type ActiveTabId = string | null;

type ElementRef = React.RefObject<HTMLElement | null>;

type FocusOverride = {
	id: string,
	forActiveTabId: ActiveTabId
};