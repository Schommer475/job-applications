import usePositionsApi from "../../hooks/usePositionsApi.tsx";
import {useRef} from "react";
import type {Position} from "../../api/positions.ts";
import type {NoArgsCallback} from "../../types/callbacks.tsx";
import type {OnCloseProps} from "../Tabs/index.tsx";

export default function usePositionDetailTabManager () {
	const positionsApi = usePositionsApi(),
		{registerPosition, unregisterPosition, reloadPosition} = useReloadRegistry();

	function managePositionDetail (
		positionId: number,
		initialLabel: string,
		onModelUpdated: (updatedModel: DetailTabModel) => unknown,
		onClose?: (props: OnCloseProps) => unknown
	) {
		let loadAbortController: AbortController;

		const detailModel: DetailTabModel = init();

		function init (): InitialTabModel {
			registerPosition(positionId, handleReload);
			fetchDetails();

			return {
				status: "loading",
				errorMessage: null,
				errorSource: null,
				position: null,
				label: initialLabel,
				closeButtonState: "enabled",
				onClose (props: OnCloseProps) {
					loadAbortController.abort();
					unregisterPosition(positionId);
					onClose?.(props);
				},
				refreshEnabled: false,
				onRefresh: handleReload,
				clearError,
				onRemove: handleRemove
			};
		}

		function handleReload () {
			const currentStatus = detailModel.status;

			if (["loaded", "error"].includes(currentStatus)) {
				Object.assign(detailModel, {
					status: "loading",
					errorMessage: null,
					errorSource: null,
					refreshEnabled: false
				});

				onModelUpdated(detailModel);
				fetchDetails();
			}
		}

		function handleRemove () {
			const currentStatus = detailModel.status;

			if (["loaded", "error"].includes(currentStatus)) {
				Object.assign(detailModel, {
					status: "removing",
					errorMessage: null,
					errorSource: null,
					closeButtonState: "disabled",
					refreshEnabled: false
				});

				onModelUpdated(detailModel);
				removeDetails();
			}
		}

		function clearError () {
			if (detailModel.status === "error") {
				Object.assign(detailModel, {
					status: "loaded",
					errorMessage: null,
					errorSource: null
				});

				onModelUpdated(detailModel);
			}
		}

		async function fetchDetails () {
			let position;

			loadAbortController = new AbortController();

			try {
				position = await positionsApi.getById(positionId, loadAbortController);

				Object.assign(detailModel, {
					status: "loaded",
					errorMessage: null,
					errorSource: null,
					position,
					label: `${position.company}: ${position.title}`,
					closeButtonState: "enabled",
					refreshEnabled: true
				});

				onModelUpdated(detailModel);
			} catch (error) {
				if (!(error instanceof Error) || error.name !== "AbortError") {
					handleError("load", error);
				}
			}
		}

		async function removeDetails () {
			try {
				await positionsApi.remove(positionId);

				Object.assign(detailModel, {
					status: "removed",
					errorMessage: null,
					errorSource: null
				});

				onModelUpdated(detailModel);
			} catch (error) {
				if (!(error instanceof Error) || error.name !== "AbortError") {
					handleError("remove", error);
				}
			}
		}

		function handleError (source: "load" | "remove", error: unknown) {
			Object.assign(detailModel, {
				status: "error",
				errorSource: source,
				errorMessage: getErrorMessage(error),
				closeButtonState: "enabled",
				refreshEnabled: true
			});

			onModelUpdated(detailModel);
		}

		return detailModel as InitialTabModel;
	}

	return [managePositionDetail, reloadPosition] as const;
}

function useReloadRegistry () {
	const reloads = useRef<Map<number, () => void>>(new Map());

	return {
		registerPosition (positionId: number, reloadFunc: () => void) {
			if (reloads.current.has(positionId)) {
				throw new Error("Managing duplicate position detail");
			}

			reloads.current.set(positionId, reloadFunc);
		},
		unregisterPosition (positionId: number) {
			reloads.current.delete(positionId);
		},
		reloadPosition (positionId: number) {
			reloads.current.get(positionId)?.();
		}
	};
}

function getErrorMessage (error: unknown) {
	const hasMessage = typeof error === "object" &&
		error != null &&
		"message" in error &&
		typeof error.message === "string" &&
		error.message;

	let message = "An unknown error has occurred";

	if (hasMessage) {
		message = error.message as string;
	} else if (typeof error === "string" && error) {
		message = error;
	}

	return message;
}

export type DetailTabModel = {
	position: Position | null,
	// label stored and derived here so it can be routed to both the tab handle and the Detail
	label: string,
	onRemove: NoArgsCallback,
	clearError: NoArgsCallback,
	closeButtonState: "enabled" | "disabled",
	onClose: (props: OnCloseProps) => void,
	refreshEnabled: boolean,
	onRefresh: NoArgsCallback
} & (
	{
		status: "loading" | "removing" | "loaded" | "removed",
		errorMessage: null,
		errorSource: null
	} | {
		status: "error",
		errorMessage: string,
		errorSource: "load" | "remove"
	}
);

type InitialTabModel = DetailTabModel & {
	status: "loading"
};
