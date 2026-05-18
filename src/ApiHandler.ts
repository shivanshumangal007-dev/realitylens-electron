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

const registerHandler = async (name: string, email: string, password: string) => {
    try {
        const response = await api.post("/register", { name, email, password });
        return response;
    } catch (error) {
        console.error("Register error:", error);
        throw error;
    }
};

const HistoryHandler = async (userID : string) => {
    try{
        const response = await api.get(`/history/${userID}`);
        return response;
    }
    catch(error){
        console.error("History fetch error:", error);
        throw error;
    }
}

export { loginHandler, registerHandler, HistoryHandler };