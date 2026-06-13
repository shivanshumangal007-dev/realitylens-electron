import api from "./Api";
import { getApiErrorMessage } from "./utils/apiError";
import initRedis from "./RedisConnection"

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
	try{
		const Redis = await initRedis()
		const {value} = await Redis.get(`user:${token}`)
		console.log(value)
		if(value === enteredOTP){
			return true
		}else{
			throw new Error("Incorrect OTP")
		}
	}catch(err){
		console.log("OTP Checker Error", err)
		throw new Error(getApiErrorMessage(err, "OTP verification failed"))
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
};
