import type {NoArgsCallback} from "../../types/callbacks.tsx";
import TabsState from "./TabsState.tsx";
import type {TabAction as GenericTabAction} from "./TabsState.tsx";
import {useReducer, useRef, useEffect, useEffectEvent} from "react";

export default function useTabsState ({
	tabsPrefix,
	initialTabs,
	initialActiveTabId
}: UseTabsStateProps) {
	const [state, dispatch] = useReducer(updateTabsState, TabsState.initialize({
			initialTabs: initialTabs?.map(appendPartIds),
			initialActiveTabId,
			mergeTabUpdate
		})),
		stateRef = useRef<TabsState<NonInteractiveTab>>(state),
		// ref to prevent callbacks from being recreated every render
		tabActionQueueRef = useRef<QueueEntry[]>([]),
		{tabs: nonInteractiveTabs, activeTabId} = state;

	useFireOnActivateForInitialState(state);

	function hasTab (id: string) {
		return stateRef.current.hasTab(id);
	}

	function addTab (tab: InputTab, activate: boolean = false) {
		enqueue({
			type: "add tab",
			activate,
			tab: appendPartIds(tab)
		});
	}

	function activateTab (id: string) {
		enqueue({
			type: "activate tab",
			id
		});
	}

	function removeTab (id: string) {
		enqueue({
			type: "remove tab",
			id
		});
	}

	function updateTab (tab: PartialInputTab) {
		enqueue({
			type: "update tab",
			tab
		});
	}

	function enqueue (action: TabAction) {
		const tabActionQueue = tabActionQueueRef.current,
			queueIsDraining = tabActionQueue.length > 0;

		let stack;

		if (import.meta.env.DEV) {
			stack = new Error().stack;
		}

		tabActionQueue.push({action, stack});

		if (!queueIsDraining) {
			drainQueue();
		}
	}

	function drainQueue () {
		const tabActionQueue = tabActionQueueRef.current;

		while (tabActionQueue.length) {
			const {action, stack} = tabActionQueue.at(0) as QueueEntry;

			try {
				executeTabAction(action);
				tabActionQueue.shift();
			} catch (error) {
				tabActionQueue.length = 0;

				if (stack) {
					Object.assign(error as Error, {stack});
				}

				throw error;
			}
		}
	}

	function executeTabAction (action: TabAction) {
		const currentState = stateRef.current,
			nextState = currentState.computeNext(action);

		dispatch(action);

		stateRef.current = nextState;

		if (action.type === "remove tab") {
			currentState.tabs
				.find(({id}) => id === action.id)
				?.onClose?.({
					remainingTabCount: nextState.tabs.length,
					wasActive: action.id === currentState.activeTabId,
					nextActiveTabId: nextState.activeTabId
				});
		}

		if (currentState.activeTabId !== nextState.activeTabId) {
			nextState.tabs
				.find(({id}) => id === nextState.activeTabId)
				?.onActivated?.();
		}
	}

	function appendPartIds<T extends {id: string}> (
		tab: T
	): T & {handleId: string, panelId: string} {
		const id = tab.id;

		return {
			...tab,
			handleId: `${tabsPrefix}-handle-${id}`,
			panelId: `${tabsPrefix}-panel-${id}`
		};
	}

	function appendInteractionHandlers (stateTab: NonInteractiveTab): Tab {
		const {
			id,
			closeButtonState,
			onClose,
			refreshEnabled,
			onRefresh,
			onActivated,
			...remainingProps
		} = stateTab;

		let closeHandler,
			refreshHandler;

		if (
			["enabled", "disabled"].includes(closeButtonState ?? "") ||
			(closeButtonState === undefined && onClose)
		) {
			closeHandler = {
				enabled: closeButtonState !== "disabled",
				callback: () => {
					removeTab(id);
				}
			};
		}

		if (onRefresh) {
			refreshHandler = {
				enabled: refreshEnabled ?? true,
				callback: onRefresh
			};
		}

		return {
			id,
			closeHandler,
			refreshHandler,
			onSelected () {
				activateTab(id);
			},
			...remainingProps
		};
	}

	return {
		tabs: nonInteractiveTabs.map(appendInteractionHandlers),
		activeTabId,
		hasTab,
		addTab,
		activateTab,
		removeTab,
		updateTab
	};
}

function useFireOnActivateForInitialState (state: TabsState<NonInteractiveTab>) {
	const onInitialActivation = useEffectEvent(() => {
		state.tabs.find(({id}) => id === state.activeTabId)
			?.onActivated?.();
	});

	useEffect(() => {
		onInitialActivation();
	}, []);
}

function updateTabsState (state: TabsState<NonInteractiveTab>, action: TabAction) {
	return state.computeNext(action);
}

function mergeTabUpdate (tab: NonInteractiveTab, update: Omit<Partial<NonInteractiveTab>, "id">): NonInteractiveTab {
	return {
		id: tab.id,
		handleId: tab.handleId,
		panelId: tab.panelId,
		label: update.label ?? tab.label,
		onActivated: mergeOptionalProperty(tab, update, "onActivated"),
		closeButtonState: mergeOptionalProperty(tab, update, "closeButtonState"),
		onClose: mergeOptionalProperty(tab, update, "onClose"),
		refreshEnabled: mergeOptionalProperty(tab, update, "refreshEnabled"),
		onRefresh: mergeOptionalProperty(tab, update, "onRefresh"),
		content: update.content ?? tab.content
	};
}

function mergeOptionalProperty<K extends OptionalKeys<NonInteractiveTab>> (
	tab: NonInteractiveTab,
	update: Omit<Partial<NonInteractiveTab>, "id">,
	key: K
): NonInteractiveTab[K] {
	let value = tab[key];

	if (Object.hasOwn(update, key)) {
		value = update[key] as NonInteractiveTab[K];
	}

	return value;
}

export type InputTab = {
	id: string,
	label: string,
	onActivated?: NoArgsCallback,
	closeButtonState?: "enabled" | "disabled" | "gone",
	/**
	 * Called before onActivated fires for nextActiveTabId, if it fires.
	 * If onActivated is scheduled to fire, calls to activateTab, addTab,
	 * or removeTab will be queued until after it is fired
	 **/
	onClose?: (props: OnCloseProps) => unknown,
	refreshEnabled?: boolean,
	onRefresh?: NoArgsCallback,
	content: React.ReactNode
};

export type PartialInputTab = Partial<InputTab> & {
	id: string
};

export type OnCloseProps = {
	remainingTabCount: number,
	wasActive: boolean,
	nextActiveTabId: string | null
};

type NonInteractiveTab = InputTab & {
	handleId: string,
	panelId: string
};

type Tab = Omit<NonInteractiveTab, "closeButtonState" | "onActivated" | "onClose" | "refreshEnabled" | "onRefresh"> & {
	onSelected: () => void,
	closeHandler?: {
		enabled: boolean,
		callback: () => void
	},
	refreshHandler?: {
		enabled: boolean,
		callback: NoArgsCallback
	}
};

type TabAction = GenericTabAction<NonInteractiveTab>;

type UseTabsStateProps = {
	tabsPrefix: string,
	initialTabs?: InputTab[],
	initialActiveTabId?: string
};

type QueueEntry = {
	action: TabAction,
	stack?: string
};

type OptionalKeys<T> = {
	[K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T];