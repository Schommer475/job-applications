import Tabs from "../Tabs";
import type {InputTab, TabsAPI, OnCloseProps} from "../Tabs";
import "./DetailsPanel.css";
import PositionDetails, {usePositionDetailTabManager} from "../PositionDetails";
import type {DetailTabModel} from "../PositionDetails";
import MessageOverlay from "../MessageOverlay";
import {
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	createRef
} from "react";
import type {NoArgsCallback} from "../../types/callbacks";
import PositionForm, {usePositionFormTabManager} from "../PositionForm";
import type {PositionFormApi, FormTabModel} from "../PositionForm";
import type {Position} from "../../api/positions";

export default function DetailsPanel ({
	ref,
	onTabOpened,
	onTabClosed,
	onPositionsModified
}: DetailsPanelProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null),
		[managePositionDetail, reloadPositionDetail] = usePositionDetailTabManager(),
		managePositionForm = usePositionFormTabManager(),
		tabsRef = useRef<TabsAPI | null>(null),
		stableCallbacks = useStableCallbacks(
			onTabOpened,
			onTabClosed,
			onPositionsModified
		);

	// despite being memoized by the react compiler,
	// linting rules don't suppress exhaustive-deps complaint
	// eslint-disable-next-line react-hooks/exhaustive-deps
	function openPositionDetails (
		positionId: number,
		initialLabel: string,
		forceReload?: boolean
	) {
		const tabs = tabsRef.current,
			tabId = `position-details-${positionId}`;

		let preExisting = false,
			opened = false;

		if (tabs && tabs.hasTab(tabId)) {
			tabs.activateTab(tabId);
			preExisting = true;
			opened = true;
		} else if (tabs) {
			tabs.addTab(detailTabModelToInputTab(
				tabId,
				managePositionDetail(
					positionId,
					initialLabel,
					onModelUpdated,
					handleEdit,
					stableCallbacks.onTabClosed
				)
			), true);
			opened = true;
		}

		if (preExisting && forceReload) {
			reloadPositionDetail(positionId);
		}

		if (opened) {
			stableCallbacks.onTabOpened();
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

		function handleEdit (currentLabel: string) {
			openPositionForm({
				positionId,
				initialPositionLabel: currentLabel
			});
		}

		function handlePositionRemoved () {
			const tabs = tabsRef.current;

			if (tabs?.hasTab(tabId)) {
				tabs.removeTab(tabId);
			}

			stableCallbacks.onPositionsModified();
		}
	}

	// despite being memoized by the react compiler,
	// linting rules don't suppress exhaustive-deps complaint
	// eslint-disable-next-line react-hooks/exhaustive-deps
	function openPositionForm (target: PositionFormTarget = {}): void {
		const formRef = createRef<PositionFormApi | null>(),
			tabs = tabsRef.current;

		let tabId = "create-position",
			opened = false;

		if (target.positionId !== undefined) {
			tabId = "edit-position-" + target.positionId;
		}

		if (tabs?.hasTab(tabId)) {
			tabs.activateTab(tabId);
			opened = true;
		} else if (tabs) {
			tabs.addTab(formTabModelToInputTab(
				tabId,
				formRef,
				managePositionForm({
					...target,
					onModelUpdated,
					onClose: stableCallbacks.onTabClosed
				})
			), true);
			opened = true;
		}

		if (opened) {
			stableCallbacks.onTabOpened();
		}

		function onModelUpdated (formModel: FormTabModel) {
			const tabs = tabsRef.current;

			if (formModel.status === "cancelled") {
				handleFormCancelled();
			} else if (formModel.status === "submitted") {
				handleFormSubmitted(formModel.returnedPosition);
			} else if (tabs && tabs.hasTab(tabId)) {
				tabs.updateTab(formTabModelToInputTab(
					tabId,
					formRef,
					formModel
				));
			} else if (formModel.submitError) {
				setErrorMessage(formModel.submitError);
			}
		}

		function handleFormCancelled () {
			const tabs = tabsRef.current;

			if (tabs?.hasTab(tabId)) {
				tabs.removeTab(tabId);
			}
		}

		function handleFormSubmitted (submissionResult: Position) {
			const tabs = tabsRef.current,
				forceReload = true;

			if (tabs?.hasTab(tabId)) {
				tabs.removeTab(tabId);
			}

			stableCallbacks.onPositionsModified();

			openPositionDetails(
				submissionResult.id,
				`${submissionResult.company}: ${submissionResult.title}`,
				forceReload
			);
		}
	}

	useImperativeHandle(ref, () => ({
		openPositionDetailsTab (positionId, initialLabel) {
			openPositionDetails(positionId, initialLabel);
		},
		openCreatePositionFormTab () {
			openPositionForm();
		},
		getTabCount () {
			return tabsRef.current?.tabCount ?? 0;
		}
	}), [
		openPositionDetails,
		openPositionForm
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

function formTabModelToInputTab (
	tabId: string,
	formRef: React.RefObject<PositionFormApi | null>,
	{
		label,
		closeButtonState,
		onClose,
		...tabModel
	}: ActiveFormTabModel
): InputTab {
	function onActivated () {
		// Delay to let the default panel activation go first
		window.requestAnimationFrame(() => formRef.current?.takeFocus());
	}

	return {
		id: tabId,
		label,
		closeButtonState,
		onClose,
		onActivated,
		content: (
			<PositionForm ref={formRef} label={label} {...tabModel} />
		)
	};
}

export type DetailsPanelAPI = {
	openPositionDetailsTab: (positionId: number, initialLabel: string) => void,
	openCreatePositionFormTab: () => void,
	getTabCount: () => number
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

type ActiveFormTabModel = FormTabModel & {
	status: Exclude<FormTabModel["status"], "submitted" | "cancelled">
};

type PositionFormTarget = {
	positionId: number,
	initialPositionLabel: string
} | {
	positionId?: undefined,
	initialPositionLabel?: undefined
};