import Tabs from "../Tabs";
import type {InputTab, TabsAPI, OnCloseProps} from "../Tabs";
import "./DetailsPanel.css";
import PositionDetails, {usePositionDetailTabManager} from "../PositionDetails";
import type {DetailTabModel} from "../PositionDetails";
import MessageOverlay from "../MessageOverlay";
import {useEffect, useImperativeHandle, useRef, useState} from "react";
import type {NoArgsCallback} from "../../types/callbacks";

export default function DetailsPanel ({
	ref,
	onTabOpened,
	onTabClosed,
	onPositionsModified
}: DetailsPanelProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null),
		managePositionDetail = usePositionDetailTabManager(),
		tabsRef = useRef<TabsAPI | null>(null),
		stableCallbacks = useStableCallbacks(
			onTabOpened,
			onTabClosed,
			onPositionsModified
		);

	useImperativeHandle(ref, () => ({
		openPositionDetailsTab (positionId, initialLabel) {
			const tabs = tabsRef.current,
				tabId = `position-details-${positionId}`;

			let created = false;

			if (tabs && tabs.hasTab(tabId)) {
				tabs.activateTab(tabId);
			} else if (tabs) {
				tabs.addTab(detailTabModelToInputTab(
					tabId,
					managePositionDetail(
						positionId,
						initialLabel,
						onModelUpdated,
						stableCallbacks.onTabClosed
					)
				), true);

				created = true;
			}

			stableCallbacks.onTabOpened();

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

				stableCallbacks.onPositionsModified();
			}

			return created;
		},
		get tabCount () {
			return tabsRef.current?.tabCount ?? 0;
		}
	}), [
		managePositionDetail,
		stableCallbacks
	]);

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

function useStableCallbacks (
	onTabOpened?: NoArgsCallback,
	onTabClosed?: (remainingTabCount: number) => unknown,
	onPositionsModified?: NoArgsCallback
) {
	const callbacksRef = useRef<{
		onTabOpened?: NoArgsCallback,
		onTabClosed?: (remainingTabCount: number) => unknown,
		onPositionsModified?: NoArgsCallback
	}>({
		onTabOpened,
		onTabClosed,
		onPositionsModified
	});

	// known possible timing error. Determined as the cleanest of available options
	useEffect(() => {
		callbacksRef.current = {
			onTabOpened,
			onTabClosed,
			onPositionsModified
		};
	}, [onTabOpened, onTabClosed, onPositionsModified]);

	return {
		onTabOpened () {
			callbacksRef.current.onTabOpened?.();
		},
		onTabClosed ({remainingTabCount}: OnCloseProps) {
			callbacksRef.current.onTabClosed?.(remainingTabCount);
		},
		onPositionsModified () {
			callbacksRef.current.onPositionsModified?.();
		}
	};
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
	onTabOpened?: NoArgsCallback,
	onTabClosed?: (remainingTabs: number) => unknown,
	onPositionsModified?: NoArgsCallback
};

type UnremovedDetailTabModel = DetailTabModel & {
	status: Exclude<DetailTabModel["status"], "removed">
};