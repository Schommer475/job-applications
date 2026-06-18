export default function getErrorMessage (error: unknown) {
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