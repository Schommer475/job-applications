export type ColumnType = "string" | "date" | "number" | "boolean";

export type Column<K extends string> = {
	readonly field: K,
	readonly label: string,
	readonly alias?: string,
	readonly format?: (value: FieldTypes[Column<K>["type"]]) => React.ReactNode,
	readonly className?: string,
	readonly type: ColumnType,
	readonly sortable?: boolean,
	readonly filterable?: boolean
};

type Config<T extends readonly Column<string>[]> =
	string extends T[number]["field"]
		? "ERROR: Configuration must be declared 'as const'"
		: T;

export type ListRecord<T extends readonly Column<string>[]> = T extends Config<T>
	? {
		[F in Field<T>]: FieldTypes[Extract<T[number], {field: F}>["type"]]
	} & {
		id: number
	}
	: never;

export type Preferences<T extends readonly Column<string>[]> = {
	paging: {
		pageSize: number
	},
	columns: ColumnState<T>[],
	sort: Sort<T>[],
	filters: Filter<T>[]
};

export type Snapshot<T extends readonly Column<string>[]> = Preferences<T> & {
	paging: {
		currentPage: number
	}
};

type FieldTypes = {
	string: string | null | undefined,
	date: string | null | undefined,
	number: number | null | undefined,
	boolean: boolean | null | undefined
};

export type ColumnState<T extends readonly Column<string>[]> = T extends Config<T>
	? {
		field: Field<T>,
		visible: boolean
	}
	: never;

export type Sort<T extends readonly Column<string>[]> = {
	field: SortableField<T>,
	direction: "ASC" | "DESC"
};

export type Filter<T extends readonly Column<string>[]> =
	FilterableColumn<T> extends infer Col
		? Col extends Column<string>
			? MapSingleColumn<Col>
			: never
		: never;

export type Field<T extends readonly Column<string>[]> = T extends Config<T>
	? T[number]["field"]
	: never;

type SortableField<T extends readonly Column<string>[]> = T extends Config<T>
	? Exclude<T[number], {sortable: false}>["field"]
	: never;

type FilterableColumn<T extends readonly Column<string>[]> = T extends Config<T>
	? Exclude<T[number], {filterable: false}>
	: never;

type MapSingleColumn<Col extends Column<string>> = {
	[Op in keyof FilterVals[Col["type"]]]: {
		field: Col["field"],
		operator: Op,
		value: FilterVals[Col["type"]][Op]
	};
}[keyof FilterVals[Col["type"]]];

type FilterVals = {
	string: {
		"is": null | string,
		"is not": null | string,
		"contains": string,
		"does not contain": string
	},
	date: {
		"is": null | RelativeDate | Date,
		"is not": null | RelativeDate | Date,
		"before": RelativeDate | Date,
		"after": RelativeDate | Date,
		"within": DateRange,
		"not within": DateRange
	},
	number: {
		"is": null | number,
		"is not": null | number,
		"more than": number,
		"less than": number
	},
	boolean: {
		"is": null | boolean,
		"is not": null | boolean
	}
};

type RelativeDate = "today" | "tomorrow" | "yesterday";

type DateRange = `${"this" | "next" | "last"} ${BasePeriod}` |
	`${"last " | ""}${number} ${Period}`;

type Period = BasePeriod | "day" | "days";
type BasePeriod = `${"week" | "month" | "year"}${"s" | ""}`;