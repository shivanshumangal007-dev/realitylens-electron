import axios from "axios";

const getApiErrorMessage = (
	error: unknown,
	fallback = "Something went wrong. Please try again.",
) => {
	if (axios.isAxiosError(error)) {
		const backendMessage =
			typeof error.response?.data?.detail === "string"
				? error.response.data.detail
				: typeof error.response?.data?.message === "string"
					? error.response.data.message
					: typeof error.response?.data === "string"
						? error.response.data
						: null;

		if (backendMessage) return backendMessage;
		if (!error.response)
			return "Unable to reach the server. Check your internet connection.";

		switch (error.response.status) {
			case 400:
				return "The request was rejected. Please check the details and try again.";
			case 401:
				return "Your session expired or the login failed. Please sign in again.";
			case 403:
				return "You do not have permission to perform this action.";
			case 404:
				return "The requested resource was not found.";
			case 429:
				return "Too many requests. Please wait a moment and try again.";
			default:
				return fallback;
		}
	}

	if (error instanceof Error && error.message) return error.message;

	return fallback;
};

export { getApiErrorMessage };
