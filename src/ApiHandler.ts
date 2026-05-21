import api from "./Api";


const loginHandler = async (username: string, password: string) => {
    try {
        const response = await api.post("/login", { username, password });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

const registerHandler = async (username: string, password: string) => {
    try {
        const response = await api.post("/register", { username, password });
        return response;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
};

const HistoryHandler = async (userID : string) => {
    try{
        const response = await api.get(`/history`);
        return response;
    }
    catch(error){
        console.error("History fetch error:", error);
        throw error;
    }
}

export { loginHandler, registerHandler, HistoryHandler };