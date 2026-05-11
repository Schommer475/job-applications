import TabHandle from "./TabHandle.tsx";
import type {TabHandleProps} from "./TabHandle.tsx";
import React, {useEffect, useRef} from "react";

export default function TabRibbon ({activeTabId, tabs}: TabRibbonProps) {
	const ribbonRef = useRef<HTMLUListElement | null>(null);

	useHorizontalScrolling(ribbonRef);
	useScrollIntoViewOnActivation(ribbonRef, activeTabId);

	return (
		<ul ref={ribbonRef} className="tab-ribbon" role="tablist">
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
						<TabHandle active={active} {...props} />
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

function useScrollIntoViewOnActivation (scrollContainerRef: ElementRef, activeTabId: ActiveTabId) {
	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;

		if (scrollContainer && activeTabId !== null) {
			scrollContainer.querySelector("li.active")?.scrollIntoView();
		}
	}, [scrollContainerRef, activeTabId]);
}

type TabRibbonProps = {
	activeTabId: ActiveTabId,
	tabs: Omit<TabHandleProps, "active">[]
};

type ActiveTabId = string | null;

type ElementRef = React.RefObject<HTMLElement | null>;