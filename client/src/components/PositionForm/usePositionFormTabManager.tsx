import usePositionsApi from "../../hooks/usePositionsApi.tsx";
import useStatusesApi from "../../hooks/useStatusesApi.tsx";
import getErrorMessage from "../../util/getErrorMessage.ts";
import type {SubmittedPosition, Position} from "../../api/positions.ts";
import type {OnCloseProps} from "../Tabs/index.tsx";
import type {InitialData} from "./useFormData.tsx";

export default function usePositionFormTabManager () {
	const positionsApi = usePositionsApi(),
		statusesApi = useStatusesApi();

	function managePositionForm ({
		positionId,
		initialPositionLabel,
		onModelUpdated,
		onClose
	}: ManagePositionFormProps) {
		let loadAbortController: AbortController;

		const formModel: FormTabModel = init();

		function init (): InitialTabModel {
			let initialLabel: string;

			if (positionId && initialPositionLabel) {
				initialLabel = "Edit " + initialPositionLabel;
			} else {
				initialLabel = "Create Position";
			}

			fetchInitialData();

			return {
				status: "loading",
				loadErrorMessage: null,
				submitError: null,
				initialData: null,
				label: initialLabel,
				closeButtonState: "enabled",
				onClose (props: OnCloseProps) {
					loadAbortController.abort();
					onClose?.(props);
				},
				onCancel: handleCancel,
				clearSubmitError,
				onSubmit: handleSubmit
			};
		}

		function clearSubmitError () {
			if (formModel.submitError && formModel.status === "loaded") {
				formModel.submitError = null;
				onModelUpdated(formModel);
			}
		}

		function handleCancel () {
			if (formModel.status === "loaded" || formModel.status === "load-error") {
				onModelUpdated(Object.assign(formModel, {
					status: "canceled"
				}));
			}
		}

		function handleSubmit (position: SubmittedPosition) {
			if (formModel.status === "loaded") {
				Object.assign(formModel, {
					status: "submitting",
					submitError: null,
					closeButtonState: "disabled"
				});

				onModelUpdated(formModel);
				submitPosition(position);
			}
		}

		async function fetchInitialData () {
			let positionPromise: Promise<Position | null>,
				newLabel;

			loadAbortController = new AbortController();

			try {
				if (positionId !== undefined) {
					positionPromise = positionsApi.getById(positionId, loadAbortController);
				} else {
					positionPromise = Promise.resolve(null);
				}

				const [statuses, position] = await Promise.all([
					statusesApi.get(loadAbortController),
					positionPromise
				]);

				if (position) {
					newLabel = `Edit ${position.company}: ${position.title}`;
				} else {
					newLabel = "Create Position";
				}

				Object.assign(formModel, {
					status: "loaded",
					initialData: {
						statuses,
						position
					},
					label: newLabel
				});

				onModelUpdated(formModel);
			} catch (error) {
				if (!(error instanceof Error) || error.name !== "AbortError") {
					loadAbortController.abort();
					Object.assign(formModel, {
						status: "load-error",
						loadErrorMessage: getErrorMessage(error)
					});

					onModelUpdated(formModel);
				}
			}
		}

		async function submitPosition (position: SubmittedPosition) {
			let result: Position;

			try {
				if (positionId === undefined) {
					result = await positionsApi.create(position);
				} else {
					result = await positionsApi.update(positionId, position);
				}

				Object.assign(formModel, {
					status: "submitted",
					closeButtonState: "enabled",
					returnedPosition: result
				});

				onModelUpdated(formModel);
			} catch (error) {
				Object.assign(formModel, {
					status: "loaded",
					submitError: getErrorMessage(error),
					closeButtonState: "enabled"
				});

				onModelUpdated(formModel);
			}
		}

		return formModel as InitialTabModel;
	}

	return managePositionForm;
}

export type FormTabModel = {
	label: string,
	clearSubmitError: () => void,
	onSubmit: (position: SubmittedPosition) => void,
	onCancel: () => void,
	closeButtonState: "enabled" | "disabled",
	onClose: (props: OnCloseProps) => void
} & ({
	status: "loading",
	loadErrorMessage: null,
	initialData: null,
	submitError: null
} | {
	status: "canceled",
	loadErrorMessage: string | null,
	initialData: InitialData | null,
	submitError: string | null
} | {
	status: "load-error",
	loadErrorMessage: string,
	initialData: null,
	submitError: null
} | {
	status: "loaded",
	loadErrorMessage: null,
	initialData: InitialData,
	submitError: string | null
} | {
	status: "submitting",
	loadErrorMessage: null,
	initialData: InitialData,
	submitError: null
} | {
	status: "submitted",
	loadErrorMessage: null,
	initialData: InitialData,
	submitError: null,
	returnedPosition: Position
});

type InitialTabModel = FormTabModel & {
	status: "loading"
};

type ManagePositionFormProps = {
	onModelUpdated: (updatedModel: FormTabModel) => unknown,
	onClose?: (props: OnCloseProps) => unknown
} & ({
	positionId: number,
	initialPositionLabel: string
} | {
	positionId?: undefined,
	initialPositionLabel?: undefined
});