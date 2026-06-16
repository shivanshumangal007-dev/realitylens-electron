import api from "./Api";
import { getApiErrorMessage } from "./utils/apiError";

const loginHandler = async (email: string, password: string) => {
	try {
		const response = await api.post("/login", { email, password });
		return response;
	} catch (error) {
		console.error("Login error:", error);
		throw new Error(
			getApiErrorMessage(error, "Login failed. Please try again."),
		);
	}
};


const OTP_checker = async (token : string, enteredOTP: string) => {
	try {
		// Send the OTP to your backend server instead of connecting to Redis directly from the browser
		const response = await api.post("/verify-otp", { token, otp: enteredOTP });
		return response.data;
	} catch(err) {
		console.error("OTP Checker Error", err);
		throw new Error(getApiErrorMessage(err, "OTP verification failed"));
	}
}

const registerHandler = async (
	username: string,
	email: string,
	password: string,
) => {
	try {
		const response = await api.post("/register", { username, email, password });
		return response;
	} catch (error) {
		console.error("Register error:", error);
		throw new Error(
			getApiErrorMessage(error, "Registration failed. Please try again."),
		);
	}
};

const HistoryHandler = async () => {
	try {
		const response = await api.get(`/history`);
		return response;
	} catch (error) {
		console.error("History fetch error:", error);
		throw new Error(
			getApiErrorMessage(error, "Unable to load history right now."),
		);
	}
};

const submitImageHandler = async (image: File) => {
	try {
		const formData = new FormData();
		formData.append("file", image);

		const response = await api.post("/submit", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response;
	} catch (error) {
		console.error("Image submission error:", error);
		throw new Error(
			getApiErrorMessage(error, "Image submission failed. Please try again."),
		);
	}
};

const submitTextHandler = async (text: string) => {
	try {
		const response = await api.post("/submit-text", { input: text });
		return response;
	} catch (error) {
		console.error("Text submission error:", error);
		throw new Error(
			getApiErrorMessage(error, "Text submission failed. Please try again."),
		);
	}
}

const getJobStatusHandler = async (jobId: string) => {
	try {
		const response = await api.get(`/status/${jobId}`);
		return response;
	} catch (error) {
		console.error("Job status fetch error:", error);
		throw new Error(
			getApiErrorMessage(error, "Unable to check verification status."),
		);
	}
};
const getJobResultHandler = async (jobId: string) => {
	try {
		const response = await api.get(`/result/${jobId}`);
		return response;
	} catch (error) {
		console.error("Job result fetch error:", error);
		throw new Error(
			getApiErrorMessage(error, "Unable to load verification result."),
		);
	}
};

const fetchUser = async () => {
	try {
		const response = await api.get("/me");
		return response;
	} catch (error) {
		console.error("User fetch error:", error);
		throw new Error(getApiErrorMessage(error, "Unable to load your profile."));
	}
};
const updateProfileHandler = async (data: { username?: string; email?: string; password?: string }) => {
	try {
		const response = await api.patch("/change-user-details", data);
		return response;
	} catch (error) {
		console.error("Profile update error:", error);
		throw new Error(getApiErrorMessage(error, "Failed to update profile."));
	}
};

const OTPcheckerUpdateHandler = async (data : {otp: string, token: string}) => {
	try{
		const response = await api.post("/verify-update", data);
		return response;
	}catch(err) {
		console.error("OTP Checker Update Error", err);
		throw new Error(getApiErrorMessage(err, "Failed to update OTP"));
	}
}

const deleteAccount = async () => {
	try{
		const response = await api.delete("/delete-account");
		return response;
	}catch(err) {
		console.error("Delete account error", err);
		throw new Error(getApiErrorMessage(err, "Failed to delete account"));
	}
}
const verifyOTPDelete = async (otp : string , token: string) => {
	try {
		const response = await api.post("/verify-delete",  {otp, token});
		return response;
	}catch(err){
		console.error("OTP Checker Delete Error", err);
		throw new Error(getApiErrorMessage(err, "Failed to verify OTP"));
	}
}
export {
	loginHandler,
	registerHandler,
	HistoryHandler,
	submitImageHandler,
	getJobStatusHandler,
	getJobResultHandler,
	fetchUser,
	submitTextHandler,
	OTP_checker,
	updateProfileHandler,
	OTPcheckerUpdateHandler,
	deleteAccount,
	verifyOTPDelete,
};
