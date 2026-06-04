import type {Status} from "../../api/statuses.ts";
import type {Position} from "../../api/positions.ts";
import React, {useReducer} from "react";

export default function useFormData (
	initialData: InitialData
): [FormData, React.Dispatch<FormDataAction>] {
	const [formData, dispatch] = useReducer(updateFormData, initialDataToFormData(initialData));

	return [formData, dispatch];
}

function updateFormData (state: FormData, action: FormDataAction): FormData {
	let result = state;

	switch (action.type) {
		case "update field":
			result = applyFieldPatch(state, action.fieldSpecifier, {
				value: action.value
			});
			break;
		case "set error":
			result = applyFieldPatch(state, action.fieldSpecifier, {
				error: action.error
			});
			break;
		case "add important link":
			result = {
				...state,
				importantLinks: state.importantLinks.concat(emptyImportantLink())
			};
			break;
		case "remove important link":
			result = {
				...state,
				importantLinks: state.importantLinks.filter(
					link => link.identifier !== action.importantLinkIdentity
				)
			};
			break;
		case "add interview":
			result = {
				...state,
				interviews: state.interviews.concat(emptyInterview())
			};
			break;
		case "remove interview":
			result = {
				...state,
				interviews: state.interviews.filter(
					interview => interview.identifier !== action.interviewIdentity
				)
			};
			break;
		case "clear errors":
			result = clearAllErrors(state);
			break;
		default:
			action satisfies never;
	}

	return result;
}

function applyFieldPatch (
	state: FormData,
	fieldSpecifier: FieldSpecifier,
	patch: InputPatch
): FormData {
	let result: FormData;

	if ("interviewIdentity" in fieldSpecifier) {
		result = applyInterviewPatch(
			state,
			fieldSpecifier.path,
			fieldSpecifier.interviewIdentity,
			patch
		);
	} else if ("importantLinkIdentity" in fieldSpecifier) {
		result = applyImportantLinkPatch(
			state,
			fieldSpecifier.path,
			fieldSpecifier.importantLinkIdentity,
			patch
		);
	} else {
		result = applyBaseFieldPatch(state, fieldSpecifier.path, patch);
	}

	return result;
}

function applyBaseFieldPatch (state: FormData, path: BaseFieldSpecifier["path"], patch: InputPatch): FormData {
	let result = state;

	switch (path) {
		case "company":
			result = {
				...state,
				company: {
					...state.company,
					...patch
				}
			};
			break;
		case "title":
			result = {
				...state,
				title: {
					...state.title,
					...patch
				}
			};
			break;
		case "status:id":
			result = {
				...state,
				status: {
					id: {
						...state.status.id,
						...patch
					}
				}
			};
			break;
		case "dateApplied":
			result = {
				...state,
				dateApplied: {
					...state.dateApplied,
					...patch
				}
			};
			break;
		case "workArrangement:type":
			result = {
				...state,
				workArrangement: {
					...state.workArrangement,
					type: {
						...state.workArrangement.type,
						...patch
					}
				}
			};
			break;
		case "workArrangement:travelMinutes":
			result = {
				...state,
				workArrangement: {
					...state.workArrangement,
					travelMinutes: {
						...state.workArrangement.travelMinutes,
						...patch
					}
				}
			};
			break;
		case "notes":
			result = {
				...state,
				notes: {
					...state.notes,
					...patch
				}
			};
			break;
		default:
			path satisfies never;
	}

	return result;
}

function applyImportantLinkPatch (state: FormData, path: ImportantLinkFieldSpecifier["path"], identity: string, patch: InputPatch): FormData {
	return {
		...state,
		importantLinks: state.importantLinks.map(link => {
			let updatedLink = link;

			if (link.identifier === identity) {
				updatedLink = patchImportantLink(link, path, patch);
			}

			return updatedLink;
		})
	};
}

function patchImportantLink (link: FormData["importantLinks"][number], path: ImportantLinkFieldSpecifier["path"], patch: InputPatch): FormData["importantLinks"][number] {
	let updatedLink = link;

	switch (path) {
		case "importantLinks.label":
			updatedLink = {
				...link,
				label: {
					...link.label,
					...patch
				}
			};
			break;
		case "importantLinks.url":
			updatedLink = {
				...link,
				url: {
					...link.url,
					...patch
				}
			};
			break;
		default:
			path satisfies never;
	}

	return updatedLink;
}

function applyInterviewPatch (state: FormData, path: InterviewFieldSpecifier["path"], identity: string, patch: InputPatch): FormData {
	return {
		...state,
		interviews: state.interviews.map(interview => {
			let updatedInterview = interview;

			if (interview.identifier === identity) {
				updatedInterview = patchInterview(interview, path, patch);
			}

			return updatedInterview;
		})
	};
}

function patchInterview (interview: FormData["interviews"][number], path: InterviewFieldSpecifier["path"], patch: InputPatch): FormData["interviews"][number] {
	let updatedInterview = interview;

	switch (path) {
		case "interviews.label":
			updatedInterview = {
				...interview,
				label: {
					...interview.label,
					...patch
				}
			};
			break;
		case "interviews.scheduled:date":
			updatedInterview = {
				...interview,
				scheduled: {
					...interview.scheduled,
					date: {
						...interview.scheduled.date,
						...patch
					}
				}
			};
			break;
		case "interviews.scheduled:time":
			updatedInterview = {
				...interview,
				scheduled: {
					...interview.scheduled,
					time: {
						...interview.scheduled.time,
						...patch
					}
				}
			};
			break;
		case "interviews.duration:hours":
			updatedInterview = {
				...interview,
				duration: {
					...interview.duration,
					hours: {
						...interview.duration.hours,
						...patch
					}
				}
			};
			break;
		case "interviews.duration:minutes":
			updatedInterview = {
				...interview,
				duration: {
					...interview.duration,
					minutes: {
						...interview.duration.minutes,
						...patch
					}
				}
			};
			break;
		case "interviews.location":
			updatedInterview = {
				...interview,
				location: {
					...interview.location,
					...patch
				}
			};
			break;
		case "interviews.meetingLink":
			updatedInterview = {
				...interview,
				meetingLink: {
					...interview.meetingLink,
					...patch
				}
			};
			break;
		default:
			path satisfies never;
	}

	return updatedInterview;
}

function clearAllErrors (state: FormData): FormData {
	return {
		company: withoutError(state.company),
		title: withoutError(state.title),
		status: {
			id: withoutError(state.status.id)
		},
		dateApplied: withoutError(state.dateApplied),
		workArrangement: {
			type: withoutError(state.workArrangement.type),
			travelMinutes: withoutError(state.workArrangement.travelMinutes)
		},
		notes: withoutError(state.notes),
		importantLinks: state.importantLinks.map(link => ({
			...link,
			label: withoutError(link.label),
			url: withoutError(link.url)
		})),
		interviews: state.interviews.map(interview => ({
			...interview,
			label: withoutError(interview.label),
			scheduled: {
				date: withoutError(interview.scheduled.date),
				time: withoutError(interview.scheduled.time)
			},
			duration: {
				hours: withoutError(interview.duration.hours),
				minutes: withoutError(interview.duration.minutes)
			},
			location: withoutError(interview.location),
			meetingLink: withoutError(interview.meetingLink)
		}))
	};
}

function withoutError<FieldType extends {error?: string | null}> (field: FieldType): FieldType {
	return {
		...field,
		error: null
	};
}

function emptyImportantLink () {
	return {
		identifier: crypto.randomUUID(),
		label: {
			value: ""
		},
		url: {
			value: ""
		}
	};
}

function emptyInterview () {
	return {
		identifier: crypto.randomUUID(),
		label: {
			value: ""
		},
		scheduled: {
			date: {
				value: ""
			},
			time: {
				value: ""
			}
		},
		duration: {
			hours: {
				value: ""
			},
			minutes: {
				value: ""
			}
		},
		location: {
			value: ""
		},
		meetingLink: {
			value: ""
		}
	};
}

function initialDataToFormData ({statuses, position}: InitialData): FormData {
	const hideZero = true,
		selectedStatus = (
			statuses.find(status => status.id === position?.status.id) ??
			statuses.find(status => status.name === "Applied") ??
			statuses.at(0)
		) as Status,
		workArrangementTypeOptions = ["", "In Person", "Remote", "Hybrid"],
		selectedWorkArrangement = workArrangementTypeOptions.find(
			arrangementType => arrangementType === position?.workArrangement.type
		) ?? "";

	return {
		company: {
			value: position?.company ?? ""
		},
		title: {
			value: position?.title ?? ""
		},
		status: {
			id: {
				value: String(selectedStatus.id),
				options: statuses.map(status => ({
					value: String(status.id),
					label: status.name
				}))
			}
		},
		dateApplied: {
			value: formatDate(position?.dateApplied) || formatDate(new Date())
		},
		workArrangement: {
			type: {
				value: selectedWorkArrangement,
				options: workArrangementTypeOptions.map(option => ({
					value: option,
					label: option
				}))
			},
			travelMinutes: {
				value: numberToString(position?.workArrangement.travelMinutes, hideZero)
			}
		},
		notes: {
			value: position?.notes ?? ""
		},
		importantLinks: (position?.importantLinks ?? []).map(({label, url}) => ({
			identifier: crypto.randomUUID(),
			label: {
				value: label
			},
			url: {
				value: url
			}
		})),
		interviews: (position?.interviews ?? []).map(interview => ({
			identifier: crypto.randomUUID(),
			label: {
				value: interview.label
			},
			scheduled: {
				date: {
					value: formatDate(interview.scheduled)
				},
				time: {
					value: formatTime(interview.scheduled)
				}
			},
			duration: {
				hours: {
					value: numberToString(interview.duration?.hours, hideZero)
				},
				minutes: {
					value: numberToString(interview.duration?.minutes, hideZero)
				}
			},
			location: {
				value: interview.location ?? ""
			},
			meetingLink: {
				value: interview.meetingLink ?? ""
			}
		}))
	};
}

function formatDate (date: string | Date | null | undefined) {
	let formatted = "",
		parsedDate;

	if (date) {
		parsedDate = new Date(date);
	}

	if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
		formatted = `${parsedDate.getMonth() + 1}/${parsedDate.getDate()}/` +
			parsedDate.getFullYear();
	}

	return formatted;
}

function formatTime (date: string | Date | null | undefined) {
	let formatted = "",
		parsedDate,
		hour,
		minute;

	if (date) {
		parsedDate = new Date(date);
	}

	if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
		hour = (parsedDate.getHours() % 12) || 12;
		minute = parsedDate.getMinutes();

		formatted = `${hour}:${String(minute).padStart(2, "0")} ${getAmPm(parsedDate)}`;
	}

	return formatted;
}

function getAmPm (date: Date) {
	let meridiem = "am";

	if (date.getHours() >= 12) {
		meridiem = "pm";
	}

	return meridiem;
}

function numberToString (value: number | null | undefined, hideZero?: boolean) {
	let formatted = "";

	if (value != null && (value || !hideZero)) {
		formatted = String(value);
	}

	return formatted;
}

export type InitialData = {
	statuses: Status[],
	position: Position | null
};

export type FormData = {
	company: Input,
	title: Input,
	status: {
		id: Select
	},
	dateApplied: Input,
	workArrangement: {
		type: Select,
		travelMinutes: Input
	},
	notes: Input,
	importantLinks: {
		identifier: string,
		label: Input,
		url: Input
	}[],
	interviews: {
		identifier: string,
		label: Input,
		scheduled: {
			date: Input,
			time: Input
		},
		duration: {
			hours: Input,
			minutes: Input
		},
		location: Input,
		meetingLink: Input
	}[]
};

export type Input = {
	value: string,
	error?: string | null
};

type Select = Input & {
	options: {
		value: string,
		label: string
	}[]
};

type InputPatch = {
	value: string
} | {
	error: string | null
};

type FormDataAction = UpdateFieldAction |
	SetErrorAction |
	AddImportantLinkAction |
	RemoveImportantLinkAction |
	AddInterviewAction |
	RemoveInterviewAction |
	ClearErrorsAction;

type UpdateFieldAction = {
	type: "update field",
	fieldSpecifier: FieldSpecifier,
	value: string
};

type SetErrorAction = {
	type: "set error",
	fieldSpecifier: FieldSpecifier,
	error: string
};

type AddImportantLinkAction = {
	type: "add important link"
};

type RemoveImportantLinkAction = {
	type: "remove important link",
	importantLinkIdentity: string
};

type AddInterviewAction = {
	type: "add interview"
};

type RemoveInterviewAction = {
	type: "remove interview",
	interviewIdentity: string
};

type ClearErrorsAction = {
	type: "clear errors"
};

export type FieldSpecifier = BaseFieldSpecifier |
	ImportantLinkFieldSpecifier |
	InterviewFieldSpecifier;

type BaseFieldSpecifier = {
	path: "company" |
		"title" |
		"status:id" |
		"dateApplied" |
		"workArrangement:type" |
		"workArrangement:travelMinutes" |
		"notes"
};

type ImportantLinkFieldSpecifier = {
	path: "importantLinks.label" |
		"importantLinks.url",
	importantLinkIdentity: string
};

type InterviewFieldSpecifier = {
	path: "interviews.label" |
		"interviews.scheduled:date" |
		"interviews.scheduled:time" |
		"interviews.duration:hours" |
		"interviews.duration:minutes" |
		"interviews.location" |
		"interviews.meetingLink",
	interviewIdentity: string
};