import api from "./Api";


const loginHandler = async (email: string, password: string) => {
    try {
        const response = await api.post("/login", { email, password });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

const registerHandler = async (username: string, email: string, password: string) => {
    try {
        const response = await api.post("/register", { username, email , password });
        return response;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
};

const HistoryHandler = async () => {
    try{
        const response = await api.get(`/history`);
        return response;
    }
    catch(error){
        console.error("History fetch error:", error);
        throw error;
    }
}

const submitImageHandler = async (image : File) => {
    try{
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
        throw error;
    }
}

const getJobStatusHandler = async (jobId : string) => {
    try{
        const response = await api.get(`/status/${jobId}`);
        return response;
    }
    catch(error){
        console.error("Job status fetch error:", error);
        throw error;
    } 
}
const getJobResultHandler = async (jobId : string) => {
    try{
        const response = await api.get(`/result/${jobId}`);
        return response;
    }
    catch(error){
        console.error("Job result fetch error:", error);
        throw error;
    } 
}

const fetchUser = async () => {
    try{
        const response = await api.get("/me");
        return response;
    }
    catch(error){
        console.error("User fetch error:", error);
        throw error;
    }
}
export { loginHandler, registerHandler, HistoryHandler, submitImageHandler, getJobStatusHandler, getJobResultHandler, fetchUser  };