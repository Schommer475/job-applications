import Tabs from "../Tabs";
import type {InputTab, TabsAPI, OnCloseProps} from "../Tabs";
import "./DetailsPanel.css";
import PositionDetails, {usePositionDetailTabManager} from "../PositionDetails";
import type {DetailTabModel} from "../PositionDetails";
import MessageOverlay from "../MessageOverlay";
import {useImperativeHandle, useRef, useState} from "react";

export default function DetailsPanel ({ref, onTabClosed, onPositionRemoved}: DetailsPanelProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null),
		managePositionDetail = usePositionDetailTabManager(),
		tabsRef = useRef<TabsAPI | null>(null),
		onTabClosedRef = useRef<((remainingTabCount: number) => unknown) | undefined>(onTabClosed),
		onPositionRemovedRef = useRef<((positionId: number) => unknown) | undefined>(
			onPositionRemoved
		);

	useImperativeHandle(ref, () => {
		onTabClosedRef.current = onTabClosed;
		onPositionRemovedRef.current = onPositionRemoved;

		function onClose ({remainingTabCount}: OnCloseProps) {
			onTabClosedRef.current?.(remainingTabCount);
		}

		return {
			openPositionDetailsTab (positionId, initialLabel) {
				const tabs = tabsRef.current,
					tabId = `position-details-${positionId}`;

				let created = false;

				if (tabs && tabs.hasTab(tabId)) {
					tabs.activateTab(tabId);
				} else if (tabs) {
					tabs.addTab(detailTabModelToInputTab(
						tabId,
						managePositionDetail(positionId, initialLabel, onModelUpdated, onClose)
					), true);

					created = true;
				}

				function onModelUpdated (detailModel: DetailTabModel) {
					const tabs = tabsRef.current;

					if (detailModel.status === "removed") {
						handlePositionRemoved();
					} else if (tabs && tabs.hasTab(tabId)) {
						tabs.updateTab(detailTabModelToInputTab(
							tabId,
							detailModel as UnremovedDetailTabModel
						));
					} else if (detailModel.status === "error" && detailModel.errorSource === "remove") {
						setErrorMessage(detailModel.errorMessage);
					}
				}

				function handlePositionRemoved () {
					const tabs = tabsRef.current;

					if (tabs?.hasTab(tabId)) {
						tabs.removeTab(tabId);
					}

					onPositionRemovedRef.current?.(positionId);
				}

				return created;
			},
			get tabCount () {
				return tabsRef.current?.tabCount ?? 0;
			}
		};
	}, [onTabClosed, onPositionRemoved, managePositionDetail]);

	return (
		<div className="details-panel">
			<MessageOverlay
				showing={Boolean(errorMessage)}
				title="Error"
				message={errorMessage || ""}
				onAcknowledge={() => setErrorMessage(null)}
			>
				<Tabs ref={tabsRef} />
			</MessageOverlay>
		</div>
	);
}

function detailTabModelToInputTab (tabId: string, {
	label,
	closeButtonState,
	onClose,
	refreshEnabled,
	onRefresh,
	errorSource,
	...tabModel
}: UnremovedDetailTabModel): InputTab {
	return {
		id: tabId,
		label,
		closeButtonState,
		onClose,
		refreshEnabled,
		onRefresh,
		content: (
			<PositionDetails label={label} {...tabModel} />
		)
	};
}

export type DetailsPanelAPI = {
	openPositionDetailsTab: (positionId: number, initialLabel: string) => boolean,
	readonly tabCount: number
};

type DetailsPanelProps = {
	ref?: React.RefObject<DetailsPanelAPI | null>,
	onTabClosed?: (remainingTabs: number) => unknown,
	onPositionRemoved?: (positionId: number) => unknown
};

type UnremovedDetailTabModel = DetailTabModel & {
	status: Exclude<DetailTabModel["status"], "removed">
};