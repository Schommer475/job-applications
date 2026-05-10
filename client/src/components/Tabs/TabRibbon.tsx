import TabHandle from "./TabHandle.tsx";
import type {TabHandleProps} from "./TabHandle.tsx";
import {useEffect, useRef} from "react";

export default function TabRibbon ({tabs}: {tabs: TabHandleProps[]}) {
	const ribbonRef = useRef<HTMLUListElement | null>(null);

	useHorizontalScrolling(ribbonRef);

	return (
		<ul ref={ribbonRef} className="tab-ribbon" role="tablist">
			{tabs.map(props => {
				const classNames = ["tab-handle"];

				if (props.active) {
					classNames.push("active");
				}

				return (
					<li
						key={props.id}
						className={classNames.join(" ")}
						role="presentation"
						title={props.label}
					>
						<TabHandle {...props} />
					</li>
				);
			})}
		</ul>
	);
}

function useHorizontalScrolling (elementRef: React.RefObject<HTMLElement | null>) {
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