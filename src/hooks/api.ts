import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/v1";

export const login = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email,
            password
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Login failed. Please check your credentials.");
    }
}

export const register = async (email: string, password: string, password_confirmation: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            email,
            password,
            password_confirmation
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("Registration failed. Please check your details.");
    }
}

export const logout = async (token: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/logout`, {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Logout successful:", response.data);
        return response.data;
    } catch (error) {
        console.error("Logout failed:", error);
        throw new Error("Logout failed. Please try again later.");
    }
}

export const fetchProfile = async (token: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Profile fetched successfully:", response.data);
         // Assuming the API returns the user profile data in response.data
         // Adjust this based on your actual API response structure
        return response.data;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        throw new Error("Failed to fetch profile. Please try again later.");
    }
}

export const updateProfile = async (token: string, userData: any) => {
    try {
        const response = await axios.patch(`${BASE_URL}/profile`, userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: userData
        });
        console.log("Profile updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to update profile:", error);
        throw new Error("Failed to update profile. Please try again later.");
    }
}



/*
    ANALYSIS
*/

export const newAnalysis = async (token: string, analysisData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/risk-assessments`, analysisData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: analysisData
        });

        console.log("New analysis created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to create new analysis:", error);
        throw new Error("Failed to create new analysis. Please try again later.");
    }
}

export const personalizeAnalysis = async (token: string, slug: string) => {
    try {
        const response = await axios.patch(`${BASE_URL}/risk-assessments/${slug}/personalize`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                "message": "Personalization endpoint reached successfully. Ready for Gemini integration.",
                "assessment_slug": `${slug}`
            }
        });
        console.log("Analysis personalized successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to personalize analysis:", error);
        throw new Error("Failed to personalize analysis. Please try again later.");
    }
}

/*
    HISTORY
*/
export const fetchDashboard = async(token: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        console.log("Dashboard data fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        throw new Error("Failed to fetch dashboard data. Please try again later.");
    }
}



/*    
    AI CHAT
*/
export const fetchChatHistory = async (token: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/chat/conversations`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Chat history fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch chat history:", error);
        throw new Error("Failed to fetch chat history. Please try again later.");
    }
}

export const fetchConversation = async (token: string, slug: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/chat/conversations/${slug}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Conversation fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch conversation:", error);
        throw new Error("Failed to fetch conversation. Please try again later.");
    }
}

export const newConversation = async (token: string, conversationData: any) => {
    try {
        const response = await axios.post(`${BASE_URL}/chat/conversations`, conversationData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: conversationData
        });
        console.log("New conversation created successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to create new conversation:", error);
        throw new Error("Failed to create new conversation. Please try again later.");
    }
}

export const continueConversation = async (token: string, slug: string, message: string) => {
    try {
        const response = await axios.post(`${BASE_URL}/chat/conversations/${slug}/messages`, {
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log("Conversation continued successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to continue conversation:", error);
        throw new Error("Failed to continue conversation. Please try again later.");
    }
}