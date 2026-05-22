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

const registerHandler = async (email: string, password: string) => {
    try {
        const response = await api.post("/register", { email , password });
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

export { loginHandler, registerHandler, HistoryHandler };