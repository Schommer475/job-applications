const privateConstructorKey = Symbol("constructor key");

export default class TabsState<Tab extends BasicTab> {
	#tabs: Tab[];
	#tabIds: Set<string>;
	#activationStack: string[];
	#mergeTabUpdate: MergeTabUpdateFunction<Tab>;

	static initialize<Tab extends BasicTab> ({
		initialTabs,
		initialActiveTabId,
		mergeTabUpdate
	}: InitTabsStateProps<Tab>): TabsState<Tab> {
		const tabs = [...(initialTabs ?? [])],
			tabIds = new Set(tabs.map(({id}) => id)),
			activationStack = Array.from(tabIds)
				.toReversed()
				.filter(id => id !== initialActiveTabId);

		if (tabs.length !== tabIds.size) {
			throw new Error("Initial tabs must have unique ids");
		}

		if (initialActiveTabId !== undefined && !tabIds.has(initialActiveTabId)) {
			throw new Error("initialActiveTabId must match one of the tab ids");
		}

		if (initialActiveTabId !== undefined) {
			activationStack.push(initialActiveTabId);
		}

		return new TabsState(privateConstructorKey, {
			tabs,
			tabIds,
			activationStack,
			mergeTabUpdate
		});
	}

	constructor (key: symbol, {
		tabs,
		tabIds,
		activationStack,
		mergeTabUpdate
	}: TabsStateProps<Tab>) {
		if (key !== privateConstructorKey) {
			throw new Error("Constructor is for internal use only. Use initialize or computeNext");
		}

		this.#tabs = tabs;
		this.#tabIds = tabIds;
		this.#activationStack = activationStack;
		this.#mergeTabUpdate = mergeTabUpdate;
	}

	get tabs () {
		return this.#tabs;
	}

	get activeTabId () {
		return this.#activationStack.at(-1) ?? null;
	}

	hasTab (id: string) {
		return this.#tabIds.has(id);
	}

	computeNext (action: TabAction<Tab>): TabsState<Tab> {
		const actionType = action.type;

		let updatedState;

		switch (actionType) {
			case "activate tab":
				updatedState = this.#updateActiveTab(action);
				break;
			case "remove tab":
				updatedState = this.#removeTab(action);
				break;
			case "add tab":
				updatedState = this.#addTab(action);
				break;
			case "update tab":
				updatedState = this.#updateTab(action);
				break;
			default:
				actionType satisfies never;
				throw new Error("Unknown update type: " + actionType);
		}

		return updatedState;
	}

	#updateActiveTab ({id}: ActivateTabAction): TabsState<Tab> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let newState: TabsState<Tab> = this;

		if (!this.hasTab(id)) {
			throw new Error("Invalid tab activated: " + id);
		}

		if (id !== this.activeTabId) {
			newState = new TabsState(privateConstructorKey, {
				tabs: this.tabs,
				tabIds: this.#tabIds,
				activationStack: this.#activationStack
					.filter(whereNotExcludedId.bind(null, id))
					.concat(id),
				mergeTabUpdate: this.#mergeTabUpdate
			});
		}

		return newState;
	}

	#removeTab ({id}: RemoveTabAction): TabsState<Tab> {
		const whereNotId = whereNotExcludedId.bind(null, id);

		if (!this.#tabIds.has(id)) {
			throw new Error("Invalid tab removed: " + id);
		}

		return new TabsState(privateConstructorKey, {
			tabIds: new Set([...this.#tabIds].filter(whereNotId)),
			tabs: this.tabs.filter(({id: tabId}) => tabId !== id),
			activationStack: this.#activationStack
				.filter(whereNotId),
			mergeTabUpdate: this.#mergeTabUpdate
		});
	}

	#addTab (action: AddTabAction<Tab>): TabsState<Tab> {
		const {activate, tab} = action,
			id = tab.id,
			performActivation = activate || this.tabs.length === 0,
			activationStack = Array.from(this.#activationStack);

		if (this.hasTab(id)) {
			throw new Error("tab already exists: " + id);
		}

		if (performActivation) {
			activationStack.push(id);
		}

		return new TabsState(privateConstructorKey, {
			tabIds: new Set([...this.#tabIds].concat(id)),
			tabs: this.tabs.concat(tab),
			activationStack,
			mergeTabUpdate: this.#mergeTabUpdate
		});
	}

	#updateTab ({tab: {id, ...update}}: UpdateTabAction<Tab>): TabsState<Tab> {
		if (!this.hasTab(id)) {
			throw new Error("invalid tab updated: " + id);
		}

		return new TabsState(privateConstructorKey, {
			tabIds: this.#tabIds,
			tabs: this.tabs.map(tab => {
				let storedTab = tab;

				if (tab.id === id) {
					storedTab = this.#mergeTabUpdate(tab, update);
				}

				return storedTab;
			}),
			activationStack: this.#activationStack,
			mergeTabUpdate: this.#mergeTabUpdate
		});
	}
}

function whereNotExcludedId (excludedId: string, id: string) {
	return excludedId !== id;
}

type InitTabsStateProps<Tab extends BasicTab> = {
	initialTabs?: Tab[],
	initialActiveTabId?: string,
	mergeTabUpdate: MergeTabUpdateFunction<Tab>
};

export type TabAction<Tab extends BasicTab> = AddTabAction<Tab> |
	ActivateTabAction |
	RemoveTabAction |
	UpdateTabAction<Tab>;

type AddTabAction<Tab extends BasicTab> = {
	type: "add tab",
	tab: Tab,
	activate: boolean
};

type RemoveTabAction = {
	type: "remove tab",
	id: string
};

type ActivateTabAction = {
	type: "activate tab",
	id: string
};

type UpdateTabAction<Tab extends BasicTab> = {
	type: "update tab",
	tab: Partial<Tab> & BasicTab
};

type MergeTabUpdateFunction<Tab extends BasicTab> = (tab: Tab, update: Omit<Partial<Tab>, "id">) => Tab;

type TabsStateProps<Tab extends BasicTab> = {
	tabs: Tab[],
	tabIds: Set<string>,
	activationStack: string[],
	mergeTabUpdate: MergeTabUpdateFunction<Tab>
};

type BasicTab = {id: string};